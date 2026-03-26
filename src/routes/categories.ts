import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db/index.js'
import { categories } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { apiKeyAuth } from '../middleware/auth.js'

const createSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['income', 'expense', 'savings']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export async function categoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', apiKeyAuth)

  app.get('/categories', async (_req, reply) => {
    const rows = await db.select().from(categories).orderBy(categories.name)
    reply.send(rows)
  })

  app.post('/categories', async (req, reply) => {
    const body = createSchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() })
    }

    const [created] = await db
      .insert(categories)
      .values(body.data)
      .returning()

    reply.status(201).send(created)
  })

  app.delete('/categories/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await db.delete(categories).where(eq(categories.id, Number(id)))
    reply.status(204).send()
  })
}
