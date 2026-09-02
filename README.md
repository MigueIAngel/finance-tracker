# Finance Tracker

Aplicación personal de finanzas para registrar ingresos, gastos y ahorros, ver el
resumen del mes y seguir planes de ahorro.

Consta de dos piezas:

- **API** (raíz del repo) — Fastify + Drizzle ORM sobre PostgreSQL.
- **Web** (`frontend/`) — Next.js 15 (App Router) + React 19 + Tailwind + Recharts.

El frontend nunca habla directo con la API: pasa por rutas proxy en
`frontend/app/api/proxy/*`, que añaden la `x-api-key` en el servidor para que la
clave nunca llegue al navegador.

---

## Uso de la app

Al entrar se pide una contraseña única (`APP_PASSWORD`). Si es correcta se guarda
una cookie de sesión firmada (JWT, 30 días) y se accede a las cuatro secciones:

### Resumen

Panel del mes en curso con:

- Totales de ingresos, gastos y ahorro, y el balance
  (`ingresos − gastos − ahorro`).
- **Gastos por categoría** — dona con el reparto del mes.
- **Evolución del balance** — línea con los últimos 6 meses.
- Últimas transacciones registradas.

### Transacciones

- Listado filtrable por **mes/año**, **tipo** (ingreso / gasto / ahorro) y
  **categoría**.
- **Nueva** — monto, tipo, categoría, nota y fecha. Si el tipo es *ahorro* se
  puede asociar a un plan de ahorro, y el aporte cuenta para su progreso.
- Cada fila se puede editar (monto, categoría) o eliminar, con confirmación.
- **Clasificar pendientes** — si existe una categoría cuyo nombre contenga
  «pendiente», aparece un botón que reasigna esas transacciones a la categoría
  que corresponda a partir del texto de la nota, una por una y mostrando el
  progreso. Requiere `GEMINI_API_KEY` (ver *Variables de entorno*); sin esa
  clave el resto de la app funciona igual.

### Categorías

Crear y eliminar categorías. Cada una tiene nombre, tipo (ingreso / gasto /
ahorro) y color, que es el que se usa en las gráficas. Al borrar una categoría
las transacciones no se pierden: quedan sin categoría.

La primera vez que arranca la API se siembran categorías por defecto (Salario,
Freelance, Comida, Transporte, Renta, etc.) si la tabla está vacía.

### Ahorro

Planes de ahorro de dos tipos:

- **`monthly`** — apartar un monto cada mes.
- **`goal`** — llegar a un monto total, con fecha límite opcional.

Cada plan muestra cuánto se lleva ahorrado y el porcentaje de avance, calculado
sumando las transacciones de tipo *ahorro* asociadas al plan. Los planes se
pueden desactivar o eliminar.

---

## Puesta en marcha

Requisitos: Node.js 20+ y una base de datos PostgreSQL.

### 1. API

```bash
npm install
cp .env.example .env      # y rellenar los valores
npm run db:push           # crea las tablas en la base de datos
npm run dev               # http://localhost:3000
```

### 2. Web

```bash
cd frontend
npm install
# crear frontend/.env.local (ver más abajo)
npm run dev               # http://localhost:3001 si la API ocupa el 3000
```

---

## Variables de entorno

### API — `.env` en la raíz

| Variable       | Descripción                                              |
| -------------- | -------------------------------------------------------- |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL.                        |
| `API_KEY`      | Clave que exige la API en la cabecera `x-api-key`.        |
| `PORT`         | Puerto de escucha. Por defecto `3000`.                   |

### Web — `frontend/.env.local`

| Variable         | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `BACKEND_URL`    | URL base de la API, p. ej. `http://localhost:3000`.                |
| `API_KEY`        | La misma `API_KEY` de la API; la añade el proxy del servidor.       |
| `APP_PASSWORD`   | Contraseña de acceso a la web.                                     |
| `SESSION_SECRET` | Secreto para firmar el JWT de sesión (cadena larga y aleatoria).    |
| `GEMINI_API_KEY` | Opcional. Habilita el botón «Clasificar pendientes».               |

---

## Scripts

### API (raíz)

| Comando             | Qué hace                                          |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Servidor en modo watch con `tsx`.                 |
| `npm run build`     | Compila TypeScript a `dist/`.                     |
| `npm start`         | Ejecuta `dist/index.js`.                          |
| `npm run db:push`   | Sincroniza el esquema con la base de datos.       |
| `npm run db:studio` | Abre Drizzle Studio para inspeccionar los datos.  |

### Web (`frontend/`)

| Comando          | Qué hace                        |
| ---------------- | ------------------------------- |
| `npm run dev`    | Next.js en desarrollo.          |
| `npm run build`  | Build de producción.            |
| `npm start`      | Sirve el build.                 |
| `npm test`       | Tests con Vitest.               |
| `npm run lint`   | ESLint.                         |

---

## API

Todas las rutas cuelgan de `/api` y exigen la cabecera `x-api-key`.
`GET /health` es pública (la usa el healthcheck del hosting).

| Método   | Ruta                       | Descripción                                                                                   |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| `GET`    | `/api/transactions`        | Lista transacciones. Filtros: `month`, `year`, `type`, `categoryId`, `limit` (máx. 500), `offset`. Por defecto, el mes actual. |
| `GET`    | `/api/transactions/summary`| Totales de ingresos, gastos, ahorro y balance de un `month`/`year`.                            |
| `POST`   | `/api/transactions`        | Crea una transacción.                                                                          |
| `PATCH`  | `/api/transactions/:id`    | Actualiza monto y/o categoría.                                                                 |
| `DELETE` | `/api/transactions/:id`    | Elimina una transacción.                                                                       |
| `GET`    | `/api/categories`          | Lista categorías.                                                                              |
| `POST`   | `/api/categories`          | Crea una categoría.                                                                            |
| `DELETE` | `/api/categories/:id`      | Elimina una categoría.                                                                         |
| `GET`    | `/api/savings`             | Lista planes con `savedAmount` y `progressPercent`.                                            |
| `POST`   | `/api/savings`             | Crea un plan.                                                                                  |
| `PATCH`  | `/api/savings/:id`         | Actualiza un plan (incluido `isActive`).                                                       |
| `DELETE` | `/api/savings/:id`         | Elimina un plan.                                                                               |

Los cuerpos se validan con Zod; un cuerpo inválido devuelve `400` con el detalle
de los campos.

---

## Modelo de datos

- **`categories`** — `name` (único), `type` (`income` | `expense` | `savings`), `color`.
- **`savings_plans`** — `name`, `type` (`monthly` | `goal`), `target_amount`, `deadline`, `is_active`.
- **`transactions`** — `amount`, `type`, `category_id`, `savings_plan_id`, `note`, `date`.

Al borrar una categoría o un plan, las transacciones asociadas conservan el
registro y su referencia queda a `NULL`.

---

## Despliegue

La API trae configuración lista para **Railway** (`railway.json`) y **Render**
(`render.yaml`); ambos usan `/health` como healthcheck. El frontend es un
proyecto Next.js estándar, desplegable en Vercel o en cualquier host de Node.
Recuerda definir las variables de entorno en cada plataforma.
