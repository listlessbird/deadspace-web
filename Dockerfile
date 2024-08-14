FROM imbios/bun-node:1.1.22-22.6.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps

# RUN apt update -y && apt install libc6-compat -y
# RUN apk add --no-cache libc6-compat

WORKDIR /app

# COPY package.json .

# COPY bun.lockb .

COPY package.json bun.lockb* yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    elif [ -f bun.lockb ]; then bun install; \
    else echo "Lockfile not found." && exit 1; \
    fi


# RUN bun install

# COPY . .

# RUN bun run build

# CMD ["bun", "run", "start"]

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN --mount=type=secret,id=NEXT_PUBLIC_UPLOADTHING_APP_ID \
    --mount=type=secret,id=UPLOADTHING_SECRET \
    --mount=type=secret,id=DB_URL \
    --mount=type=secret,id=POSTGRES_DB \
    --mount=type=secret,id=POSTGRES_USER \
    --mount=type=secret,id=POSTGRES_PASSWORD \
    export NEXT_PUBLIC_UPLOADTHING_APP_ID=$(cat /run/secrets/NEXT_PUBLIC_UPLOADTHING_APP_ID) && \
    export UPLOADTHING_SECRET=$(cat /run/secrets/UPLOADTHING_SECRET) && \
    export DB_URL=$(cat /run/secrets/DB_URL) && \
    export POSTGRES_DB=$(cat /run/secrets/POSTGRES_DB) && \
    export POSTGRES_USER=$(cat /run/secrets/POSTGRES_USER) && \
    export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD) && \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    elif [ -f bun.lockb ]; then bun run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1002 nodejs
RUN adduser --system --uid 1002 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
