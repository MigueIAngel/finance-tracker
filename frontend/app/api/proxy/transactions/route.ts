import { NextRequest, NextResponse } from 'next/server'
import { proxyFetch } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString()
  const res = await proxyFetch(`/api/transactions${qs ? `?${qs}` : ''}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const res = await proxyFetch('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
