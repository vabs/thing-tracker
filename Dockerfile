# syntax=docker/dockerfile:1

# ---- Build stage: install all deps, compile native modules, build frontend ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Toolchain so better-sqlite3 can compile if no prebuilt binary is available.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* vars at build time — the Clerk publishable key must be
# present now, not at runtime. Pass it with: --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_...
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

# Drop dev dependencies but keep the compiled better-sqlite3 (a prod dep).
RUN npm prune --omit=dev

# ---- Runtime stage: lean image, no toolchain, no dev deps ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# SQLite lives on a mounted volume so data survives redeploys.
ENV DB_PATH=/data/data.db

RUN mkdir -p /data

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
VOLUME ["/data"]

# Clerk secret/publishable keys are injected as runtime env by Coolify.
CMD ["node", "server/index.js"]
