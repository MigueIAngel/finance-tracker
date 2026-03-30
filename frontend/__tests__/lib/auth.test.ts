// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-32chars!!'
})

describe('auth', () => {
  it('creates a valid session token and verifies it', async () => {
    const { createSessionToken, verifySessionToken } = await import('@/lib/auth')
    const token = await createSessionToken()
    expect(token).toBeTruthy()
    const valid = await verifySessionToken(token)
    expect(valid).toBe(true)
  })

  it('returns false for an invalid token', async () => {
    const { verifySessionToken } = await import('@/lib/auth')
    const valid = await verifySessionToken('not-a-valid-token')
    expect(valid).toBe(false)
  })
})
