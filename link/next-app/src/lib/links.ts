import { prisma } from './prisma'
import type { Link } from '@prisma/client'

export type LinkData = Link

export function generateShortCode(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return timestamp + random
}

export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

export async function saveLink(url: string, userId?: string): Promise<LinkData> {
  const shortCode = generateShortCode()

  const linkData = await prisma.link.create({
    data: {
      shortCode,
      originalUrl: url,
      userId: userId || null
    }
  })

  return linkData
}

export async function getLink(code: string): Promise<LinkData | null> {
  const link = await prisma.link.findUnique({
    where: {
      shortCode: code
    }
  })

  return link
}

export async function getAllLinks(): Promise<LinkData[]> {
  const links = await prisma.link.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return links
}