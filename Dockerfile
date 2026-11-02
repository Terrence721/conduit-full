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
COPY --from=build /app/frontend/dist ./frontend/dist
COPY backend/package.json ./backend/
COPY package.json ./
EXPOSE 3001
CMD ["node", "backend/dist/index.js"]
