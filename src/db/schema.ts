import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core'

export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense', 'savings'])
export const savingsPlanTypeEnum = pgEnum('savings_plan_type', ['monthly', 'goal'])

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  type: transactionTypeEnum('type').notNull(),
  color: text('color').notNull().default('#6366f1'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const savingsPlans = pgTable('savings_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  // monthly: save X per month | goal: reach X total (optionally by deadline)
  type: savingsPlanTypeEnum('type').notNull(),
  targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
  deadline: timestamp('deadline'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  savingsPlanId: integer('savings_plan_id').references(() => savingsPlans.id, {
    onDelete: 'set null',
  }),
  note: text('note'),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type SavingsPlan = typeof savingsPlans.$inferSelect
export type NewSavingsPlan = typeof savingsPlans.$inferInsert
