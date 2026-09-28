import { db } from './index.js'
import { categories, savingsPlans, transactions, type NewTransaction } from './schema.js'

/** Deterministic pseudo-random numbers so the demo looks the same after every restart. */
function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

const monthsAgo = (n: number, day: number) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - n)
  d.setDate(Math.min(day, 28))
  d.setHours(12, 0, 0, 0)
  return d
}

/** Six months of fictional activity for the public demo. Runs only on an empty database. */
export async function seedDemoData() {
  const existing = await db.select().from(transactions).limit(1)
  if (existing.length > 0) return

  const [pending] = await db
    .insert(categories)
    .values({ name: 'Pendiente por clasificar', type: 'expense', color: '#94a3b8' })
    .returning()
  const byName = Object.fromEntries((await db.select().from(categories)).map(c => [c.name, c.id]))

  const plans = await db
    .insert(savingsPlans)
    .values([
      { name: 'Fondo de emergencia', type: 'goal', targetAmount: '6000000' },
      { name: 'Viaje a Cartagena', type: 'goal', targetAmount: '2500000', deadline: monthsAgo(-4, 15) },
      { name: 'Ahorro mensual', type: 'monthly', targetAmount: '300000' },
    ])
    .returning()

  const rnd = random(42)
  const vary = (base: number, spread = 0.25) =>
    String(Math.round((base * (1 - spread + rnd() * spread * 2)) / 100) * 100)
  const rows: NewTransaction[] = []
  const add = (months: number, day: number, type: NewTransaction['type'], category: string, amount: string, note: string, savingsPlanId?: number) =>
    rows.push({ type, amount, note, date: monthsAgo(months, day), categoryId: byName[category], savingsPlanId })

  for (let m = 5; m >= 0; m--) {
    add(m, 1, 'income', 'Salario', '4200000', 'Nómina')
    if (m % 2 === 0) add(m, 18, 'income', 'Freelance', vary(900000), 'Proyecto freelance: landing page')
    add(m, 3, 'expense', 'Renta', '1300000', 'Arriendo apartamento')
    add(m, 6, 'expense', 'Servicios', vary(210000), 'Energía, agua y gas')
    add(m, 7, 'expense', 'Servicios', '95000', 'Internet hogar')
    for (let w = 0; w < 4; w++) {
      add(m, 4 + w * 7, 'expense', 'Comida', vary(160000), 'Mercado de la semana')
      add(m, 5 + w * 7, 'expense', 'Transporte', vary(45000), 'Transporte público y taxis')
    }
    add(m, 12, 'expense', 'Entretenimiento', vary(120000), 'Cine y salida con amigos')
    add(m, 20, 'expense', 'Comida', vary(85000), 'Almuerzo en restaurante')
    if (m % 3 === 1) add(m, 22, 'expense', 'Salud', vary(150000), 'Cita médica')
    if (m % 3 === 2) add(m, 25, 'expense', 'Ropa', vary(230000), 'Ropa de temporada')
    add(m, 2, 'savings', 'Ahorro general', '300000', 'Aporte mensual', plans[2].id)
    add(m, 15, 'savings', 'Ahorro general', vary(400000, 0.1), 'Aporte al fondo de emergencia', plans[0].id)
    if (m < 4) add(m, 16, 'savings', 'Ahorro general', '250000', 'Ahorro para el viaje', plans[1].id)
  }

  // Uncategorised expenses so the "Clasificar pendientes" (AI) button has something to do.
  for (const note of ['Domicilio de pizza', 'Uber al aeropuerto', 'Suscripción a Netflix', 'Farmacia: vitaminas']) {
    rows.push({ type: 'expense', amount: vary(60000, 0.5), note, date: monthsAgo(0, 8 + rows.length % 10), categoryId: pending.id })
  }

  await db.insert(transactions).values(rows)
}
