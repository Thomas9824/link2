import { NextRequest, NextResponse } from 'next/server';

// Store pour le rate limiting en mémoire (pour une solution simple)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuration du rate limiting
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // max 100 requêtes par fenêtre
  createLinkLimit: 20, // max 20 créations de liens par fenêtre
};

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';
  return `ip:${ip}`;
}

function checkRateLimit(key: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Nouvelle fenêtre ou première requête
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: limit - record.count };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne pas appliquer le rate limiting aux assets statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    const rateLimitKey = getRateLimitKey(request);

    // Rate limiting général
    const generalLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIG.maxRequests);

    if (!generalLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.',
          retryAfter: RATE_LIMIT_CONFIG.windowMs / 1000
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
            'X-RateLimit-Remaining': generalLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_CONFIG.windowMs).toISOString(),
          },
        }
      );
    }

    // Rate limiting spécifique pour la création de liens
    if (pathname === '/api/links' && request.method === 'POST') {
      const createLimitKey = `create:${rateLimitKey}`;
      const createLimit = checkRateLimit(createLimitKey, RATE_LIMIT_CONFIG.createLinkLimit);

      if (!createLimit.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Limite de création de liens atteinte. Veuillez réessayer dans 15 minutes.',
            retryAfter: RATE_LIMIT_CONFIG.windowMs / 1000
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': RATE_LIMIT_CONFIG.createLinkLimit.toString(),
              'X-RateLimit-Remaining': createLimit.remaining.toString(),
            },
          }
        );
      }
    }

    // Ajouter des headers de sécurité
    const response = NextResponse.next();

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;"
    );

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};