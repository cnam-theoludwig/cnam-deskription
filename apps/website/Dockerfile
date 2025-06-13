FROM node:22.16.0-slim AS node-pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ENV TURBO_TELEMETRY_DISABLED=1
ENV DO_NOT_TRACK=1
WORKDIR /usr/src/app

FROM node-pnpm AS builder
COPY ./ ./
RUN pnpm install --global turbo@2.5.4
RUN turbo prune @repo/website --docker

FROM node-pnpm AS installer
RUN pnpm install --global replace-in-files-cli@3.0.0
COPY .gitignore .gitignore
COPY --from=builder /usr/src/app/out/json/ ./
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=builder /usr/src/app/out/full/ ./
COPY --from=builder /usr/src/app/out/full/ ./
COPY turbo.json turbo.json

ARG VERSION="0.0.0-develop"
RUN VERSION_STRIPPED=${VERSION#v} && replace-in-files --regex='version": *"[^"]*' --replacement='"version": "'"$VERSION_STRIPPED"'"' '**/package.json' '!**/node_modules/**'
RUN pnpm --filter=@repo/website... exec turbo run build

FROM node-pnpm AS runner
ENV NODE_ENV=production
RUN pnpm install mime@4.0.7 tsx@4.19.3

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 applicationrunner
USER root
USER applicationrunner
COPY --from=installer --chown=applicationrunner:nodejs /usr/src/app/apps/website/dist/deskription/browser ./apps/website/dist/deskription/browser
COPY --from=installer --chown=applicationrunner:nodejs /usr/src/app/apps/website/http-server.ts ./apps/website/http-server.ts
WORKDIR /usr/src/app/apps/website
CMD ["node", "--import=tsx", "./http-server.ts", "--path=./dist/deskription/browser"]
