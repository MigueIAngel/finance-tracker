import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { transactionRoutes } from './routes/transactions.js'
import { categoryRoutes } from './routes/categories.js'
import { savingsRoutes } from './routes/savings.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })

// Health check — no auth required (Railway uses this)
app.get('/health', async () => ({ status: 'ok' }))

// API routes
await app.register(transactionRoutes, { prefix: '/api' })
await app.register(categoryRoutes, { prefix: '/api' })
await app.register(savingsRoutes, { prefix: '/api' })

// Seed default categories on first run
app.addHook('onReady', async () => {
  const { db } = await import('./db/index.js')
  const { categories } = await import('./db/schema.js')

  const existing = await db.select().from(categories).limit(1)
  if (existing.length > 0) return

  await db.insert(categories).values([
    { name: 'Salario', type: 'income', color: '#22c55e' },
    { name: 'Freelance', type: 'income', color: '#84cc16' },
    { name: 'Inversiones', type: 'income', color: '#10b981' },
    { name: 'Comida', type: 'expense', color: '#f97316' },
    { name: 'Transporte', type: 'expense', color: '#3b82f6' },
    { name: 'Renta', type: 'expense', color: '#ef4444' },
    { name: 'Entretenimiento', type: 'expense', color: '#a855f7' },
    { name: 'Salud', type: 'expense', color: '#06b6d4' },
    { name: 'Servicios', type: 'expense', color: '#64748b' },
    { name: 'Ropa', type: 'expense', color: '#ec4899' },
    { name: 'Ahorro general', type: 'savings', color: '#f59e0b' },
  ])

  app.log.info('Default categories seeded')
})

const port = Number(process.env.PORT) || 3000

try {
  await app.listen({ port, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
