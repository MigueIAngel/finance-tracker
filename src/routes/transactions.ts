import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db/index.js'
import { transactions, categories } from '../db/schema.js'
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm'
import { apiKeyAuth } from '../middleware/auth.js'

const createSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense', 'savings']),
  categoryId: z.number().int().positive().optional(),
  savingsPlanId: z.number().int().positive().optional(),
  note: z.string().max(255).optional(),
  // ISO string — defaults to now if omitted
  date: z.string().datetime().optional(),
})

const listQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().optional(),
  type: z.enum(['income', 'expense', 'savings']).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function transactionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', apiKeyAuth)

  // GET /transactions — list with optional filters
  app.get('/transactions', async (req, reply) => {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) {
      return reply.status(400).send({ error: query.error.flatten() })
    }

    const { month, year, type, categoryId, limit, offset } = query.data
    const now = new Date()
    const targetYear = year ?? now.getFullYear()
    const targetMonth = month ?? now.getMonth() + 1

    const from = new Date(targetYear, targetMonth - 1, 1)
    const to = new Date(targetYear, targetMonth, 1)

    const filters = [
      gte(transactions.date, from),
      lte(transactions.date, to),
      ...(type ? [eq(transactions.type, type)] : []),
      ...(categoryId ? [eq(transactions.categoryId, categoryId)] : []),
    ]

    const rows = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        note: transactions.note,
        date: transactions.date,
        savingsPlanId: transactions.savingsPlanId,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...filters))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset)

    reply.send(rows)
  })

  // GET /transactions/summary — totals for a given month
  app.get('/transactions/summary', async (req, reply) => {
    const q = z
      .object({
        month: z.coerce.number().int().min(1).max(12).optional(),
        year: z.coerce.number().int().optional(),
      })
      .safeParse(req.query)

    if (!q.success) return reply.status(400).send({ error: q.error.flatten() })

    const now = new Date()
    const targetYear = q.data.year ?? now.getFullYear()
    const targetMonth = q.data.month ?? now.getMonth() + 1
    const from = new Date(targetYear, targetMonth - 1, 1)
    const to = new Date(targetYear, targetMonth, 1)

    const rows = await db
      .select({
        type: transactions.type,
        total: sql<string>`sum(${transactions.amount})`,
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(and(gte(transactions.date, from), lte(transactions.date, to)))
      .groupBy(transactions.type)

    const summary = { income: 0, expense: 0, savings: 0 }
    for (const row of rows) {
      summary[row.type] = parseFloat(row.total ?? '0')
    }

    reply.send({
      month: targetMonth,
      year: targetYear,
      income: summary.income,
      expense: summary.expense,
      savings: summary.savings,
      balance: summary.income - summary.expense - summary.savings,
    })
  })

  // POST /transactions — create
  app.post('/transactions', async (req, reply) => {
    const body = createSchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() })
    }

    const { amount, type, categoryId, savingsPlanId, note, date } = body.data

    const [created] = await db
      .insert(transactions)
      .values({
        amount: String(amount),
        type,
        categoryId,
        savingsPlanId,
        note,
        date: date ? new Date(date) : new Date(),
      })
      .returning()

    reply.status(201).send(created)
  })

  // PATCH /transactions/:id — update categoryId
  app.patch('/transactions/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({ categoryId: z.number().int().positive() }).safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() })

    const [updated] = await db
      .update(transactions)
      .set({ categoryId: body.data.categoryId })
      .where(eq(transactions.id, Number(id)))
      .returning()

    if (!updated) return reply.status(404).send({ error: 'Transaction not found' })
    reply.send(updated)
  })

  // DELETE /transactions/:id
  app.delete('/transactions/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await db.delete(transactions).where(eq(transactions.id, Number(id)))
    reply.status(204).send()
  })
}
