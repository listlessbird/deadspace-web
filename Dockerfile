FROM imbios/bun-node:1.1.22-22.6.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps


WORKDIR /app


COPY package.json bun.lockb* yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    elif [ -f bun.lockb ]; then bun install; \
    else echo "Lockfile not found." && exit 1; \
    fi



FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# we have to export again in the runner stage using an script because each RUN command runs in a new shell, and the environment variables set within it don't persist beyond that command. Also some variables needed in the build stage.

RUN --mount=type=secret,id=NEXT_PUBLIC_UPLOADTHING_APP_ID \
    --mount=type=secret,id=UPLOADTHING_SECRET \
    --mount=type=secret,id=DB_URL \
    --mount=type=secret,id=POSTGRES_DB \
    --mount=type=secret,id=POSTGRES_USER \
    --mount=type=secret,id=POSTGRES_PASSWORD \
    export NEXT_PUBLIC_UPLOADTHING_APP_ID=$(cat /run/secrets/NEXT_PUBLIC_UPLOADTHING_APP_ID | tr -d '\r') && \
    export UPLOADTHING_SECRET=$(cat /run/secrets/UPLOADTHING_SECRET | tr -d '\r') && \
    export DB_URL=$(cat /run/secrets/DB_URL | tr -d '\r') && \
    export POSTGRES_DB=$(cat /run/secrets/POSTGRES_DB | tr -d '\r') && \
    export POSTGRES_USER=$(cat /run/secrets/POSTGRES_USER | tr -d '\r') && \
    export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD | tr -d '\r') && \
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
ENV NEXT_TELEMETRY_DISABLED 1

#PUBLIC VARS
ARG NEXT_PUBLIC_UPLOADTHING_APP_ID=BAKED_NEXT_PUBLIC_UPLOADTHING_APP_ID

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
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY entrypoint.sh ./

USER root
RUN chmod 555 entrypoint.sh


USER nextjs


EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["node", "server.js"]
