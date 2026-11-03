# syntax=docker/dockerfile:1
# Multi-stage build for the conduit-full stack (Postgres is provided separately).
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc* ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN yarn install --frozen-lockfile

FROM deps AS build
COPY . .
RUN yarn workspace frontend build
RUN yarn workspace backend tsc --noEmit false --outDir dist

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/openapi.yaml ./backend/dist/openapi.yaml
COPY --from=build /app/frontend/dist ./frontend/dist
COPY backend/package.json ./backend/
COPY package.json ./
EXPOSE 3001

# Run as a non-root user and advertise a health endpoint for orchestrators.
RUN chown -R node:node /app
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3   CMD wget -qO- http://localhost:3001/healthz >/dev/null 2>&1 || exit 1

# Run pending migrations, then start the app. A failed migration aborts startup.
CMD ["sh", "-c", "yarn sqlz db:migrate && exec node backend/dist/index.js"]
