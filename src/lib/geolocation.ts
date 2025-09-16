import { NextRequest } from 'next/server';
import requestIp from 'request-ip';

// Interface pour les données de géolocalisation
export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  ip: string;
}

// Fonction pour extraire l'IP cliente de manière robuste
export function extractClientIP(request: NextRequest): string {
  // Essayer request-ip en premier
  try {
    const ip = requestIp.getClientIp({
      headers: Object.fromEntries(request.headers.entries()),
      connection: {},
      socket: {}
    } as {headers: Record<string, string>, connection: object, socket: object});

    if (ip && ip !== '::1' && ip !== '127.0.0.1') {
      return ip;
    }
  } catch (error) {
    console.warn('request-ip failed, using fallback:', error);
  }

  // Fallback manuel pour les headers courants
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    for (const ip of ips) {
      if (ip && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
        return ip;
      }
    }
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP && !realIP.startsWith('127.') && !realIP.startsWith('192.168.') && !realIP.startsWith('10.')) {
    return realIP;
  }

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP && !cfIP.startsWith('127.') && !cfIP.startsWith('192.168.') && !cfIP.startsWith('10.')) {
    return cfIP;
  }

  const xClusterIP = request.headers.get('x-cluster-client-ip');
  if (xClusterIP && !xClusterIP.startsWith('127.') && !xClusterIP.startsWith('192.168.') && !xClusterIP.startsWith('10.')) {
    return xClusterIP;
  }

  // IP par défaut pour le développement local
  return '127.0.0.1';
}

// Fonction pour extraire l'IP depuis les headers Next.js (pour les Server Components)
export function extractClientIPFromHeaders(headersList: Headers): string {
  // Essayer les différents headers dans l'ordre de priorité
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  for (const header of headers) {
    const value = headersList.get(header);
    if (value) {
      // Pour x-forwarded-for, prendre la première IP
      const ip = value.split(',')[0].trim();
      if (ip && !isLocalIP(ip)) {
        return ip;
      }
    }
  }

  return '127.0.0.1';
}

// Fonction pour vérifier si une IP est locale
function isLocalIP(ip: string): boolean {
  if (!ip) return true;

  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.') ||
    ip.startsWith('fc00:') ||
    ip.startsWith('fe80:')
  );
}

// Cache pour éviter les lookups répétés
const geoCache = new Map<string, GeoLocation>();
const CACHE_TTL = 1000 * 60 * 60; // 1 heure

// Fonction principale de géolocalisation
export async function geolocateIP(ip: string): Promise<GeoLocation> {
  // Vérifier le cache
  const cached = geoCache.get(ip);
  if (cached) {
    return cached;
  }

  const result: GeoLocation = { ip };

  // Si c'est une IP locale
  if (isLocalIP(ip)) {
    result.country = 'Local';
    result.region = 'Local';
    result.city = 'Local';
    geoCache.set(ip, result);
    return result;
  }

  // Essayer geoip-lite en premier
  try {
    const geoip = await import('geoip-lite');
    const geo = geoip.lookup(ip);
    if (geo) {
      result.country = geo.country || 'Unknown';
      result.region = geo.region || undefined;
      result.city = geo.city || undefined;
      geoCache.set(ip, result);
      return result;
    }
  } catch (error) {
    console.warn('geoip-lite lookup failed:', error);
  }

  // Fallback vers l'API publique ip-api.com (limité mais gratuit)
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        result.country = data.country || 'Unknown';
        result.region = data.regionName || undefined;
        result.city = data.city || undefined;
        geoCache.set(ip, result);
        return result;
      }
    }
  } catch (error) {
    console.warn('ip-api.com lookup failed:', error);
  }

  // Dernier fallback
  result.country = 'Unknown';
  geoCache.set(ip, result);
  return result;
}

// Fonction simplifiée pour obtenir juste le pays
export async function getCountryFromIP(ip: string): Promise<string> {
  try {
    const geo = await geolocateIP(ip);
    return geo.country || 'Unknown';
  } catch (error) {
    console.error('Error getting country from IP:', error);
    return 'Unknown';
  }
}

// Nettoyer le cache périodiquement
setInterval(() => {
  geoCache.clear();
}, CACHE_TTL);