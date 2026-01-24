# ----- Builder Stage -----
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates git && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
COPY ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy application files
COPY ../.. ./

# Build the docs app
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/docs

RUN pnpm --filter docs build

# ----- Runner Stage -----
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
    PORT=3003


# Copy build artifacts
COPY --from=builder --chown=nextjs:nextjs /app/node_modules /app/node_modules
COPY --from=builder --chown=nextjs:nextjs /app/apps/docs /app/apps/docs
COPY --from=builder --chown=nextjs:nextjs /app/package.json /app/package.json

WORKDIR /app/apps/docs

# ensure production mode
ENV NODE_ENV=production

USER nextjs
EXPOSE 3003

CMD ["sh", "-c", "pnpm start -p 3003"]
