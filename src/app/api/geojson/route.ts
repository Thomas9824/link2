import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[API] Fetching world geojson data...')

    const response = await fetch(
      'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json',
      {
        headers: {
          'User-Agent': 'Link2-Dashboard/1.0',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      console.error('[API] Failed to fetch geojson:', response.status, response.statusText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[API] Successfully fetched geojson data:', {
      type: data.type,
      featuresCount: data.features?.length
    })

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('[API] Error fetching geojson:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geojson data' },
      { status: 500 }
    )
  }
}