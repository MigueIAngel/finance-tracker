import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db/index.js'
import { savingsPlans, transactions } from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'
import { apiKeyAuth } from '../middleware/auth.js'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['monthly', 'goal']),
  targetAmount: z.number().positive(),
  // For 'goal' type: optional deadline (ISO string)
  deadline: z.string().datetime().optional(),
})

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export async function savingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', apiKeyAuth)

  // GET /savings — list all plans with progress
  app.get('/savings', async (_req, reply) => {
    const plans = await db.select().from(savingsPlans).orderBy(savingsPlans.createdAt)

    // Aggregate saved amount per plan from transactions
    const contributions = await db
      .select({
        savingsPlanId: transactions.savingsPlanId,
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(eq(transactions.type, 'savings'))
      .groupBy(transactions.savingsPlanId)

    const savedMap = new Map<number, number>()
    for (const c of contributions) {
      if (c.savingsPlanId) savedMap.set(c.savingsPlanId, parseFloat(c.total ?? '0'))
    }

    const result = plans.map((plan) => {
      const saved = savedMap.get(plan.id) ?? 0
      const target = parseFloat(plan.targetAmount)

      return {
        ...plan,
        savedAmount: saved,
        progressPercent: target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0,
      }
    })

    reply.send(result)
  })

  // POST /savings — create plan
  app.post('/savings', async (req, reply) => {
    const body = createSchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() })
    }

    const { name, type, targetAmount, deadline } = body.data

    const [created] = await db
      .insert(savingsPlans)
      .values({
        name,
        type,
        targetAmount: String(targetAmount),
        deadline: deadline ? new Date(deadline) : undefined,
      })
      .returning()

    reply.status(201).send(created)
  })

  // PATCH /savings/:id — update plan
  app.patch('/savings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = updateSchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() })
    }

    const { targetAmount, deadline, ...rest } = body.data

    const [updated] = await db
      .update(savingsPlans)
      .set({
        ...rest,
        ...(targetAmount !== undefined && { targetAmount: String(targetAmount) }),
        ...(deadline !== undefined && { deadline: new Date(deadline) }),
      })
      .where(eq(savingsPlans.id, Number(id)))
      .returning()

    if (!updated) return reply.status(404).send({ error: 'Plan not found' })

    reply.send(updated)
  })

  // DELETE /savings/:id
  app.delete('/savings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await db.delete(savingsPlans).where(eq(savingsPlans.id, Number(id)))
    reply.status(204).send()
  })
}
