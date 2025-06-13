#!/usr/bin/env bash

# Usage: ./deploy.sh
# Deploy Deskription.

echo "[$(date)] Deploying Deskription..."
cd "/home/mathys/cnam-deskription" || exit 1

environment_branch="main"
git fetch origin "$environment_branch"

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse "origin/$environment_branch")

if [[ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]]; then
  git fetch --prune
  git pull origin "$environment_branch"

  VERSION=$(git describe --tags)
  export VERSION
  echo "[$(date)] Version: $VERSION"

  docker compose up --build --detach

  service_api="deskription-api"
  echo "[$(date)] Waiting for $service_api to be ready..."
  until docker compose logs "$service_api" 2>&1 | grep -q "Ready in"; do
    sleep 5
  done
  echo "[$(date)] $service_api is ready."

  echo "[$(date)] Running database migrations..."
  docker compose exec "$service_api" bash -c "cd ../../packages/models && node --run database:migrate"

  echo "[$(date)] Deployed Deskription $VERSION."
else
  echo "[$(date)] No changes to deploy."
fi
