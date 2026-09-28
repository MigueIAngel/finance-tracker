# API for the public demo: in-memory PostgreSQL (PGlite) seeded with fictional data.
# It never connects to the real database. The web app is deployed separately with
# NEXT_PUBLIC_DEMO_MODE=true and talks to this API through its server-side proxy.

FROM node:22-slim AS build
WORKDIR /api
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
# Create the empty database once here, so startup skips initdb (the heaviest step).
RUN npm run build && node dist/scripts/demo-snapshot.js demo-db.tgz && npm prune --omit=dev

FROM node:22-slim
ENV NODE_ENV=production DATABASE_URL=pglite:memory DEMO_DB_SNAPSHOT=/api/demo-db.tgz PORT=10000
WORKDIR /api
COPY --from=build /api/node_modules ./node_modules
COPY --from=build /api/dist ./dist
COPY --from=build /api/package.json /api/demo-db.tgz ./
USER node
EXPOSE 10000
CMD ["node", "dist/index.js"]
