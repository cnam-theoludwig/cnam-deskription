FROM node:22.14.0-slim AS node-pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ENV TURBO_TELEMETRY_DISABLED=1
ENV DO_NOT_TRACK=1
WORKDIR /usr/src/app

FROM node-pnpm AS builder
COPY ./ ./
RUN pnpm install --global turbo@2.5.3
RUN turbo prune @repo/api --docker

FROM node-pnpm AS installer
COPY .gitignore .gitignore
COPY --from=builder /usr/src/app/out/json/ ./
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod
COPY --from=builder /usr/src/app/out/full/ ./
COPY turbo.json turbo.json

ARG VERSION="0.0.0-develop"
RUN pnpm install --global replace-in-files-cli@3.0.0
RUN VERSION_STRIPPED=${VERSION#v} && replace-in-files --regex='version": *"[^"]*' --replacement='"version": "'"$VERSION_STRIPPED"'"' '**/package.json' '!**/node_modules/**'
# RUN pnpm --filter=@repo/api... exec turbo run build

FROM node-pnpm AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 applicationrunner
USER root
RUN mkdir --parents /usr/src/app/apps/api/uploads
RUN chown --recursive applicationrunner:nodejs /usr/src/app/apps/api/uploads
USER applicationrunner
COPY --from=installer --chown=applicationrunner:nodejs /usr/src/app ./
WORKDIR /usr/src/app/apps/api
CMD ["node", "--import=tsx", "./src/server.ts"]
