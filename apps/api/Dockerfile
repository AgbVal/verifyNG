# Stage 1: Build the application
FROM node:24-slim AS builder

WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/database/package.json ./packages/database/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/database ./packages/database

RUN pnpm --filter @verifyng/database exec prisma generate --config=prisma7.config.ts
RUN pnpm --filter @verifyng/database build

RUN pnpm --filter api build

# Stage 2: Database migration
FROM builder AS migration

WORKDIR /app

CMD ["pnpm", "--filter", "@verifyng/database", "exec", "prisma", "migrate", "deploy", "--config=prisma7.config.ts"]

# Stage 3: Production runtime
FROM node:24-slim AS runtime

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/database/package.json ./packages/database/package.json

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/generated ./packages/database/generated

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
