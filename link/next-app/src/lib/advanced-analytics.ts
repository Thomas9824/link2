import { UAParser } from 'ua-parser-js'

export interface EnhancedClickData {
  userAgent?: string
  referer?: string
  ip?: string
  country?: string
  device?: string
  browser?: string
  os?: string
  deviceType?: string
}

export function parseUserAgent(userAgent: string): {
  browser: string | undefined
  os: string | undefined
  device: string | undefined
  deviceType: string | undefined
} {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  return {
    browser: result.browser.name ? `${result.browser.name} ${result.browser.version}` : undefined,
    os: result.os.name ? `${result.os.name} ${result.os.version}` : undefined,
    device: result.device.model || undefined,
    deviceType: result.device.type || (result.os.name === 'Android' || result.os.name === 'iOS' ? 'mobile' : 'desktop')
  }
}

export async function getCountryFromIP(ip: string): Promise<string | null> {
  try {
    // Utilisation de l'API gratuite ipapi.co pour la géolocalisation
    // En production, on pourrait utiliser une API plus robuste
    const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
      headers: {
        'User-Agent': 'Link Shortener/1.0'
      }
    })

    if (response.ok) {
      const country = await response.text()
      return country.trim()
    }
  } catch (error) {
    console.error('Error fetching country:', error)
  }

  return null
}

export function extractReferrerDomain(referer: string): string {
  try {
    const url = new URL(referer)
    return url.hostname
  } catch {
    return referer
  }
}

export function isValidReferrer(referer: string): boolean {
  return referer && referer !== 'direct' && referer.startsWith('http')
}

export async function enrichClickData(clickData: {
  userAgent?: string
  referer?: string
  ip?: string
}): Promise<EnhancedClickData> {
  const enriched: EnhancedClickData = { ...clickData }

  // Parser le User-Agent
  if (clickData.userAgent) {
    const parsed = parseUserAgent(clickData.userAgent)
    enriched.browser = parsed.browser
    enriched.os = parsed.os
    enriched.device = parsed.device
    enriched.deviceType = parsed.deviceType
  }

  // Obtenir le pays à partir de l'IP
  if (clickData.ip && clickData.ip !== '127.0.0.1' && clickData.ip !== 'localhost') {
    enriched.country = await getCountryFromIP(clickData.ip)
  }

  // Nettoyer le referer
  if (clickData.referer && isValidReferrer(clickData.referer)) {
    enriched.referer = extractReferrerDomain(clickData.referer)
  }

  return enriched
}