import { NextRequest, NextResponse } from 'next/server'
import { getClickStats } from '@/lib/analytics'

interface Props {
  params: Promise<{ shortCode: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { shortCode } = await params

    const stats = await getClickStats(shortCode)

    if (!stats) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching link stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch link statistics' },
      { status: 500 }
    )
  }
}