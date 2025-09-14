import { NextResponse } from 'next/server'
import { getAllLinksStats } from '@/lib/analytics'

export async function GET() {
  try {
    const stats = await getAllLinksStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching global stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}