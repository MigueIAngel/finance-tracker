import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo'

export async function POST(request: NextRequest) {
  const { password, guest } = await request.json()

  // In the public demo anyone can enter as a guest; the password is still required elsewhere.
  const guestAllowed = isDemoMode && guest === true
  if (!guestAllowed && (!password || password !== process.env.APP_PASSWORD)) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = await createSessionToken()

  const response = NextResponse.json({ ok: true })
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
