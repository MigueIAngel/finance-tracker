# Frontend Design Spec — Finance Tracker
**Date:** 2026-03-26

## Overview

A full-featured personal finance web app that consumes the existing Fastify REST API. Responsive (desktop + mobile). Users enter transactions via iPhone Shortcuts; the web app is used for visualization, management, and savings tracking.

---

## Architecture

- **Location:** `/frontend` directory inside the existing monorepo
- **Framework:** Next.js 15 App Router, TypeScript
- **Styles:** Tailwind CSS with CSS custom properties for the glassmorphism theme
- **Charts:** Recharts (`ResponsiveContainer`, `PieChart`, `BarChart`, `LineChart`)
- **Data fetching:** SWR — automatic revalidation, cache, loading/error states
- **Auth:** Next.js middleware checks for a `session` cookie. Login page validates against `APP_PASSWORD` env var. No user accounts or registration.
- **API proxy:** All calls to the Fastify backend go through Next.js API routes (`/api/*`). The `API_KEY` and backend `BACKEND_URL` are server-side env vars — never exposed to the browser.
- **Deploy:** Vercel (free tier, no sleep, auto-deploy on push to `master`)

### Environment variables (Vercel)
| Key | Purpose |
|---|---|
| `BACKEND_URL` | `https://finance-tracker-aisr.onrender.com` |
| `API_KEY` | Fastify API key |
| `APP_PASSWORD` | Password for the frontend login page |
| `SESSION_SECRET` | Secret for signing the session cookie |

---

## Visual Design

**Style:** Glassmorphism — deep indigo-to-blue gradient background, translucent cards with `backdrop-filter: blur`, white/purple accent colors.

**Theme tokens (CSS vars):**
- Background: `linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)`
- Card bg: `rgba(255,255,255,0.10)`, border: `rgba(255,255,255,0.15)`
- Accent: `#a78bfa` (purple), success: `#6ee7b7`, danger: `#fca5a5`

**Navigation:**
- Desktop: fixed left sidebar (160px) with 4 nav items
- Mobile: fixed bottom tab bar with 4 tabs
- Active state: highlighted background + purple right border (sidebar) / purple label (tabs)

---

## Pages

### `/login`
Single password input. On submit, validates against `APP_PASSWORD`, sets a signed `session` cookie, redirects to `/`. Middleware redirects unauthenticated requests here.

### `/` — Resumen mensual

**Month navigator:** `← Mes anterior | Mes Año | Mes siguiente →` — changing month refetches all data via SWR keys.

**4 summary cards (grid):** Balance · Ingresos · Gastos · Ahorro — each shows the monthly total.

**Donut chart (Recharts PieChart):**
- Segments = expense categories for the selected month
- Tooltip on hover: category name + amount + % of total
- Click on segment → sets active category filter → filters transaction list below
- Active filter shown as a dismissible chip above the list

**Bar chart (Recharts BarChart):**
- Last 6 months, grouped bars: Ingresos (indigo) vs Gastos (red)
- Tooltip on hover: month name + both values
- Click on a bar → navigates to that month (updates month navigator and all data)
- Current month bar highlighted with accent outline

**Line chart (Recharts LineChart):**
- X axis: last 6 months, Y axis: balance (income − expense − savings)
- Dot + tooltip on hover
- Positioned below the bar chart on desktop, scrollable on mobile

**Transaction list:**
- Shows transactions for the selected month (filtered by active category if set)
- Each row: colored dot (category color) · description · date · amount
- "Ver todas →" link navigates to `/transacciones` with the same month pre-selected

---

### `/transacciones` — Transactions

**Filters bar:** month picker · type selector (Todos / Ingreso / Gasto / Ahorro) · category dropdown — all applied client-side via SWR params.

**Transaction list:**
- Each row: category chip (colored) · note · date · amount · delete button
- Delete triggers confirmation, then `DELETE /api/transactions/:id`

**"+" FAB (floating action button):**
- Opens a modal with fields: amount (number) · type (select) · category (select, filtered by type) · note (text) · date (date, defaults to today)
- On submit: `POST /api/transactions`, closes modal, revalidates SWR

---

### `/categorias` — Categories

**Grid of cards**, one per category:
- Shows: color swatch · name · type badge (Ingreso / Gasto / Ahorro)
- Delete button (with confirmation)

**"Add category" form** (inline below grid):
- Fields: name · type (select) · color (native `<input type="color">`)
- On submit: `POST /api/categories`, revalidates

---

### `/ahorro` — Savings Plans

**Plan cards:**
- Name · type badge (Mensual / Meta)
- Progress bar: filled % with label (e.g., "68% — $680 of $1,000")
- **Monthly plan:** progress = sum of savings transactions linked to this plan in the current month vs `targetAmount`
- **Goal plan:** progress = total savings transactions ever linked to this plan vs `targetAmount`. If deadline set: shows days remaining.
- "Registrar contribución" button → modal: amount · note → creates `POST /api/transactions` with `type: savings` and `savingsPlanId`

**"Nuevo plan" button** → modal:
- Fields: name · type (Mensual / Meta) · targetAmount · deadline (only if Meta)

---

## Data Flow

```
Browser (React)
  └─ SWR hook (e.g. useTransactions)
       └─ fetch /api/proxy/transactions?month=3&year=2026    ← Next.js API route
            └─ fetch https://finance-tracker-aisr.onrender.com/api/transactions
                 with x-api-key header (server-side only)
```

Each page section has its own SWR key so revalidation is scoped. Month changes update the key, triggering refetch.

The bar chart and line chart need 6 months of summary data. The frontend fires 6 parallel calls to `/api/proxy/transactions/summary?month=X&year=Y` (one per month) and merges the results client-side. No new backend endpoint needed.

---

## Component Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout, global CSS, font
│   ├── login/page.tsx
│   ├── page.tsx                # Resumen
│   ├── transacciones/page.tsx
│   ├── categorias/page.tsx
│   ├── ahorro/page.tsx
│   └── api/
│       └── proxy/
│           ├── transactions/route.ts
│           ├── categories/route.ts
│           └── savings/route.ts
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── BottomNav.tsx
│   ├── ui/
│   │   ├── Card.tsx            # Glassmorphism card wrapper
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx           # Category/type chip
│   │   └── ProgressBar.tsx
│   ├── charts/
│   │   ├── CategoryDonut.tsx
│   │   ├── MonthlyBars.tsx
│   │   └── BalanceLine.tsx
│   └── forms/
│       ├── TransactionForm.tsx
│       ├── CategoryForm.tsx
│       └── SavingsPlanForm.tsx
├── hooks/
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── useSummary.ts
│   └── useSavingsPlans.ts
├── lib/
│   └── api.ts                  # Typed fetch wrappers for proxy routes
├── middleware.ts                # Auth cookie check
└── types.ts                    # Shared TypeScript types
```

---

## Out of Scope

- Multi-currency support
- Recurring transactions
- Push notifications
- CSV import/export
- Multiple user accounts
