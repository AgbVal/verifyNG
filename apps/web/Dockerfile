# Stage 1: Build the application
FROM node:24-slim AS builder

WORKDIR /app

RUN corepack enable

# Copy dependency metadata first to improve layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

# Install all dependencies required for the build
RUN pnpm install --frozen-lockfile

# Copy the web application source
COPY apps/web ./apps/web

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js application
RUN pnpm --filter web build


# Stage 2: Production runtime
FROM node:24-slim AS runtime

WORKDIR /app

RUN corepack enable

# Copy dependency metadata
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy the Next.js production build from the builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start"]
