import { NextResponse } from 'next/server'

const API_BASE = 'https://api.bgm.tv'
const USER_AGENT = 'FufuNext/1.0 (https://github.com/fufu)'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || 'calendar'

  try {
    const response = await fetch(`${API_BASE}/${path}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Bangumi API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bangumi proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Bangumi API' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || 'v0/search/subjects'

  try {
    const body = await request.json()
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'

    const response = await fetch(`${API_BASE}/${path}?limit=${limit}&offset=${offset}`, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Bangumi API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bangumi proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Bangumi API' },
      { status: 500 }
    )
  }
}