import { prisma } from './prisma'
import { createHash } from 'crypto'
import { enrichClickData, type EnhancedClickData } from './advanced-analytics'

export interface ClickData {
  userAgent?: string
  referer?: string
  ip?: string
}

function hashIP(ip: string): string {
  // Hash IP avec salt pour l'anonymat
  const salt = process.env.IP_SALT || 'default-salt-change-in-production'
  return createHash('sha256').update(ip + salt).digest('hex').substring(0, 16)
}

export async function recordClick(shortCode: string, clickData: ClickData = {}, analyticsConsent: boolean = true) {
  const { userAgent, referer, ip } = clickData

  try {
    // Enrichir les données de clic avec analytics avancées seulement si consentement
    let enrichedData: EnhancedClickData = { userAgent, referer, ip }
    if (analyticsConsent) {
      enrichedData = await enrichClickData({ userAgent, referer, ip })
    }

    // Transaction pour mise à jour atomique
    const result = await prisma.$transaction(async (tx) => {
      // Trouver le link
      const link = await tx.link.findUnique({
        where: { shortCode }
      })

      if (!link) {
        throw new Error('Link not found')
      }

      // Créer l'enregistrement de clic - données limitées si pas de consentement
      const clickData = {
        linkId: link.id,
        userAgent: analyticsConsent ? enrichedData.userAgent?.substring(0, 255) : null,
        referer: analyticsConsent ? enrichedData.referer?.substring(0, 255) : null,
        ipHash: ip ? hashIP(ip) : null, // IP toujours hachée pour la sécurité
        country: analyticsConsent ? enrichedData.country?.substring(0, 100) : null,
        device: analyticsConsent ? enrichedData.device?.substring(0, 100) : null,
        browser: analyticsConsent ? enrichedData.browser?.substring(0, 100) : null,
        os: analyticsConsent ? enrichedData.os?.substring(0, 100) : null,
        deviceType: analyticsConsent ? enrichedData.deviceType?.substring(0, 50) : null,
      }

      const click = await tx.click.create({
        data: clickData
      })

      // Incrémenter le compteur sur Link (toujours fait pour le fonctionnement de base)
      const updatedLink = await tx.link.update({
        where: { id: link.id },
        data: {
          clickCount: { increment: 1 }
        }
      })

      return { click, link: updatedLink }
    })

    return result
  } catch (error) {
    console.error('Error recording click:', error)
    throw error
  }
}

export async function getClickStats(shortCode: string) {
  const link = await prisma.link.findUnique({
    where: { shortCode },
    include: {
      clicks: {
        orderBy: { timestamp: 'desc' },
        take: 10
      }
    }
  })

  if (!link) {
    return null
  }

  // Calculer stats par jour (7 derniers jours)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const clicksByDay = await prisma.click.groupBy({
    by: ['timestamp'],
    where: {
      linkId: link.id,
      timestamp: { gte: sevenDaysAgo }
    },
    _count: { id: true }
  })

  // Grouper par jour
  const dailyStats = new Map<string, number>()

  for (const click of clicksByDay) {
    const day = click.timestamp.toISOString().split('T')[0]
    dailyStats.set(day, (dailyStats.get(day) || 0) + click._count.id)
  }

  // Top referers
  const refererStats = await prisma.click.groupBy({
    by: ['referer'],
    where: {
      linkId: link.id,
      referer: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  return {
    link: {
      id: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      clickCount: link.clickCount,
      createdAt: link.createdAt
    },
    recentClicks: link.clicks,
    dailyStats: Object.fromEntries(dailyStats),
    topReferers: refererStats.map(r => ({
      referer: r.referer,
      count: r._count.id
    }))
  }
}

export async function getAllLinksStats(userId?: string) {
  const whereClause = userId ? { userId } : {}

  const links = await prisma.link.findMany({
    where: whereClause,
    orderBy: { clickCount: 'desc' },
    take: 20,
    select: {
      id: true,
      shortCode: true,
      originalUrl: true,
      clickCount: true,
      createdAt: true
    }
  })

  const totalClicks = await prisma.click.count({
    where: userId ? {
      link: { userId }
    } : {}
  })

  const totalLinks = await prisma.link.count({
    where: whereClause
  })

  return {
    totalLinks,
    totalClicks,
    topLinks: links
  }
}

export async function getAdvancedStats(shortCode: string) {
  const link = await prisma.link.findUnique({
    where: { shortCode },
    include: {
      clicks: {
        orderBy: { timestamp: 'desc' },
        take: 100
      }
    }
  })

  if (!link) {
    return null
  }

  // Stats par pays
  const countryStats = await prisma.click.groupBy({
    by: ['country'],
    where: {
      linkId: link.id,
      country: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  // Stats par type d'appareil
  const deviceTypeStats = await prisma.click.groupBy({
    by: ['deviceType'],
    where: {
      linkId: link.id,
      deviceType: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })

  // Stats par navigateur
  const browserStats = await prisma.click.groupBy({
    by: ['browser'],
    where: {
      linkId: link.id,
      browser: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  // Stats par OS
  const osStats = await prisma.click.groupBy({
    by: ['os'],
    where: {
      linkId: link.id,
      os: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  return {
    link: {
      id: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      clickCount: link.clickCount,
      createdAt: link.createdAt
    },
    topCountries: countryStats.map(stat => ({
      country: stat.country!,
      count: stat._count.id
    })),
    deviceTypes: deviceTypeStats.map(stat => ({
      deviceType: stat.deviceType!,
      count: stat._count.id
    })),
    topBrowsers: browserStats.map(stat => ({
      browser: stat.browser!,
      count: stat._count.id
    })),
    topOS: osStats.map(stat => ({
      os: stat.os!,
      count: stat._count.id
    }))
  }
}