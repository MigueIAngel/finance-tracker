import { NextRequest, NextResponse } from 'next/server'
import { proxyFetch } from '@/lib/proxy'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await proxyFetch(`/api/categories/${id}`, { method: 'DELETE' })
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
