FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates git && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

ENV NEXT_TELEMETRY_DISABLED=1

# copy workspace manifests so pnpm can install workspace deps
COPY ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# copy sources and build only the docs app
COPY ../.. ./
WORKDIR /app/apps/docs

RUN pnpm --filter docs build

FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    useradd -m -u 1001 nextjs

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3001

# copy built app and node_modules from builder
COPY --from=builder --chown=nextjs:nextjs /app/apps/docs .

WORKDIR /app/apps/docs

# ensure production mode
ENV NODE_ENV=production

USER nextjs
EXPOSE 3001

CMD ["sh", "-c", "pnpm start -p 3001"]
