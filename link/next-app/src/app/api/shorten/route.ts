import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isValidUrl, saveLink, getAllLinks } from '@/lib/links'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Utilise l'ID utilisateur s'il est connecté, sinon null pour lien anonyme
    const userId = session?.user ? (session.user as any).id : undefined
    const linkData = await saveLink(url, userId)

    return NextResponse.json({
      shortCode: linkData.shortCode,
      originalUrl: url,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${linkData.shortCode}`
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const links = await getAllLinks()
  return NextResponse.json({
    message: 'URL Shortener API',
    totalLinks: links.length
  })
}