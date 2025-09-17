import { prisma } from './prisma'
import { getCountryFromIP } from './geolocation'

export interface CreateLinkData {
  originalUrl: string
  shortCode: string
  customAlias?: string
  title?: string
  description?: string
  expiresAt?: Date
}

export interface ClickData {
  userAgent?: string
  referer?: string
  ip?: string
}

export interface LinkWithClicks {
  id: string
  originalUrl: string
  shortCode: string
  customAlias: string | null
  title: string | null
  description: string | null
  isActive: boolean
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  clicks: number
  clickHistory: {
    id: string
    ipAddress: string | null
    userAgent: string | null
    referer: string | null
    country: string | null
    region: string | null
    city: string | null
    device: string | null
    browser: string | null
    os: string | null
    clickedAt: Date
  }[]
}

export class DatabaseLinksService {
  static async createLink(userId: string, linkData: CreateLinkData): Promise<LinkWithClicks> {
    const link = await prisma.link.create({
      data: {
        ...linkData,
        userId,
      },
      include: {
        clicks: true,
      },
    })

    return {
      ...link,
      clicks: 0,
      clickHistory: [],
    }
  }

  static async getLink(shortCode: string): Promise<LinkWithClicks | null> {
    const link = await prisma.link.findUnique({
      where: {
        shortCode,
        isActive: true
      },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' }
        },
      },
    })

    if (!link) {
      console.log(`❌ DatabaseLinksService: Lien ${shortCode} non trouvé ou inactif`);
      return null;
    }

    // Vérifier manuellement l'expiration
    if (link.expiresAt && link.expiresAt < new Date()) {
      console.log(`❌ DatabaseLinksService: Lien ${shortCode} expiré`);
      return null;
    }

    console.log(`✅ DatabaseLinksService: Lien ${shortCode} trouvé - ${link.originalUrl}`);

    return {
      ...link,
      clicks: link.clicks.length,
      clickHistory: link.clicks,
    }
  }

  static async getLinkByUser(userId: string, shortCode: string): Promise<LinkWithClicks | null> {
    const link = await prisma.link.findFirst({
      where: { 
        shortCode,
        userId,
      },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' }
        },
      },
    })

    if (!link) return null

    return {
      ...link,
      clicks: link.clicks.length,
      clickHistory: link.clicks,
    }
  }

  static async getUserLinks(userId: string): Promise<LinkWithClicks[]> {
    const links = await prisma.link.findMany({
      where: { userId },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return links.map((link: any) => ({
      ...link,
      clicks: link.clicks.length,
      clickHistory: link.clicks,
    }))
  }

  static async deleteLink(userId: string, shortCode: string): Promise<boolean> {
    try {
      await prisma.link.delete({
        where: {
          shortCode,
          userId,
        },
      })
      return true
    } catch {
      return false
    }
  }

  static async incrementClicks(shortCode: string, clickData?: ClickData): Promise<boolean> {
    try {
      const link = await prisma.link.findUnique({
        where: { shortCode }
      })

      if (!link) return false

      // Détecter le pays à partir de l'IP
      let country = 'Unknown'
      if (clickData?.ip) {
        try {
          country = await getCountryFromIP(clickData.ip)
        } catch (error) {
          console.error('Error getting country from IP:', error)
        }
      }

      // Créer l'enregistrement de clic
      await prisma.click.create({
        data: {
          linkId: link.id,
          ipAddress: clickData?.ip,
          userAgent: clickData?.userAgent,
          referer: clickData?.referer,
          country: country,
          device: this.detectDevice(clickData?.userAgent),
          browser: this.detectBrowser(clickData?.userAgent),
          os: this.detectOS(clickData?.userAgent),
        },
      })

      return true
    } catch (error) {
      console.error('Error incrementing clicks:', error)
      return false
    }
  }

  static async linkExists(shortCode: string): Promise<boolean> {
    const link = await prisma.link.findUnique({
      where: { shortCode },
      select: { id: true },
    })
    return !!link
  }

  static async getUserAnalytics(userId: string) {
    // Compter les liens de l'utilisateur
    const totalLinks = await prisma.link.count({
      where: { userId }
    })

    // Compter les clics sur les liens de l'utilisateur
    const totalClicks = await prisma.click.count({
      where: {
        link: {
          userId
        }
      }
    })

    // Top pays pour les liens de l'utilisateur
    const countryStats = await prisma.click.groupBy({
      by: ['country'],
      where: {
        link: {
          userId
        }
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: 10,
    })

    // Activité des 7 derniers jours pour les liens de l'utilisateur
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentClicks = await prisma.click.findMany({
      where: {
        link: {
          userId
        },
        clickedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        clickedAt: true,
      },
    })

    // Grouper par jour
    const dailyClicks: { [key: string]: number } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentClicks.forEach((click: any) => {
      const date = click.clickedAt.toISOString().split('T')[0]
      dailyClicks[date] = (dailyClicks[date] || 0) + 1
    })

    const recentActivity = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      recentActivity.push({
        date: date.toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric'
        }),
        clicks: dailyClicks[dateKey] || 0
      })
    }

    return {
      totalClicks,
      totalLinks,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topCountries: countryStats.map((stat: any) => ({
        country: stat.country || 'Unknown',
        clicks: stat._count.country,
        links: 0, // TODO: calculer le nombre de liens uniques par pays
      })),
      recentActivity,
    }
  }

  static async getGlobalAnalytics() {
    const totalLinks = await prisma.link.count()
    const totalClicks = await prisma.click.count()

    // Top pays
    const countryStats = await prisma.click.groupBy({
      by: ['country'],
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: 10,
    })

    // Activité des 7 derniers jours
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentClicks = await prisma.click.findMany({
      where: {
        clickedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        clickedAt: true,
      },
    })

    // Grouper par jour
    const dailyClicks: { [key: string]: number } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentClicks.forEach((click: any) => {
      const date = click.clickedAt.toISOString().split('T')[0]
      dailyClicks[date] = (dailyClicks[date] || 0) + 1
    })

    const recentActivity = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      recentActivity.push({
        date: date.toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric'
        }),
        clicks: dailyClicks[dateKey] || 0
      })
    }

    return {
      totalClicks,
      totalLinks,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topCountries: countryStats.map((stat: any) => ({
        country: stat.country || 'Unknown',
        clicks: stat._count.country,
        links: 0, // TODO: calculer le nombre de liens uniques par pays
      })),
      recentActivity,
    }
  }

  private static detectDevice(userAgent?: string): string {
    if (!userAgent) return 'Unknown'
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) return 'Tablet'
      return 'Mobile'
    }
    return 'Desktop'
  }

  private static detectBrowser(userAgent?: string): string {
    if (!userAgent) return 'Unknown'

    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'Chrome'
    if (/Firefox/.test(userAgent)) return 'Firefox'
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari'
    if (/Edge/.test(userAgent)) return 'Edge'
    if (/Opera/.test(userAgent)) return 'Opera'

    return 'Other'
  }

  private static detectOS(userAgent?: string): string {
    if (!userAgent) return 'Unknown'

    if (/Windows/.test(userAgent)) return 'Windows'
    if (/Mac OS/.test(userAgent)) return 'macOS'
    if (/Linux/.test(userAgent)) return 'Linux'
    if (/Android/.test(userAgent)) return 'Android'
    if (/iPhone|iPad/.test(userAgent)) return 'iOS'

    return 'Other'
  }
}
