FROM node:24-slim AS builder
 
WORKDIR /app

RUN corepack enable


COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./  
COPY apps/worker/package.json apps/worker/package.json 



RUN pnpm install --frozen-lockfile



COPY apps/worker ./apps/worker
  

RUN pnpm --filter worker build



FROM node:24-slim AS runtime

WORKDIR /app



RUN corepack enable



COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 
COPY apps/worker/package.json ./apps/worker/package.json 




RUN pnpm install --frozen-lockfile --prod



COPY --from=builder /app/apps/worker/dist ./apps/worker/dist   

CMD ["node", "apps/worker/dist/main.js"]
