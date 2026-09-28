/**
 * Public demo mode. Set at build time with NEXT_PUBLIC_DEMO_MODE=true so both the
 * login page (client) and the login route (server) see it.
 * The demo deployment runs against its own in-memory database with fictional data.
 */
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
