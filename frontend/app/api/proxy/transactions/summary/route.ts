import { NextRequest, NextResponse } from 'next/server'
import { proxyFetch } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString()
  const res = await proxyFetch(`/api/transactions/summary${qs ? `?${qs}` : ''}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
