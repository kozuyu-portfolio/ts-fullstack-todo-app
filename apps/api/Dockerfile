# ── ビルドステージ ───────────────────────────────
FROM public.ecr.aws/docker/library/node:22-slim AS builder

WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN apt-get update && apt-get install -y openssl
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm api exec prisma generate
RUN pnpm api build

# ── ランタイムステージ ───────────────────────────
FROM public.ecr.aws/docker/library/node:22-slim

RUN apt-get update && apt-get install -y openssl

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 \
     /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /var/task
COPY --from=builder /build/node_modules node_modules
COPY --from=builder /build/apps/api/dist apps/api/dist
COPY --from=builder /build/apps/api/package.json apps/api/package.json
COPY --from=builder /build/apps/api/node_modules apps/api/node_modules
COPY --from=builder /build/packages/shared node_modules/@ts-fullstack-todo/shared

ENV PORT=3000 \
    AWS_LWA_ENABLE_EXTERNAL_LOGGING=1

CMD ["node", "apps/api/dist/main.js"]