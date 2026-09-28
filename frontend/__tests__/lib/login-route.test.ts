// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const post = async (body: unknown) => {
  const { POST } = await import('@/app/api/auth/login/route')
  return POST(new NextRequest('http://localhost/api/auth/login', { method: 'POST', body: JSON.stringify(body) }))
}

describe('POST /api/auth/login', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('rejects guests outside demo mode', async () => {
    vi.stubEnv('APP_PASSWORD', 'secret')
    vi.stubEnv('SESSION_SECRET', 'x'.repeat(32))
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')
    expect((await post({ guest: true })).status).toBe(401)
  })

  it('lets guests in when the public demo mode is on', async () => {
    vi.stubEnv('APP_PASSWORD', 'secret')
    vi.stubEnv('SESSION_SECRET', 'x'.repeat(32))
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true')
    const res = await post({ guest: true })
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('session=')
  })

  it('still accepts the password', async () => {
    vi.stubEnv('APP_PASSWORD', 'secret')
    vi.stubEnv('SESSION_SECRET', 'x'.repeat(32))
    expect((await post({ password: 'secret' })).status).toBe(200)
    expect((await post({ password: 'wrong' })).status).toBe(401)
  })
})
