#!/usr/bin/env bash

set -euo pipefail

# Always run from repository root
cd "$(dirname "$0")"

export NODE_ENV="${NODE_ENV:-development}"
export API_PORT="${API_PORT:-4000}"
export APP_PORT=3000
export APP_HOST="${APP_HOST:-0.0.0.0}"
export APP_URL="${APP_URL:-http://localhost:${API_PORT}}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:${API_PORT}}"
export UI_PORT="${UI_PORT:-3000}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export REDIS_PORT="${REDIS_PORT:-6379}"
export MINIO_API_PORT="${MINIO_API_PORT:-9000}"
export MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"
export ADMINER_PORT="${ADMINER_PORT:-8080}"
export DB_HOST="${DB_HOST:-host.docker.internal}"
export DB_PORT="${DB_PORT:-5432}"
export REDIS_HOST="${REDIS_HOST:-host.docker.internal}"
export REDIS_PORT_INTERNAL="${REDIS_PORT_INTERNAL:-6379}"
export MINIO_ENDPOINT="${MINIO_ENDPOINT:-host.docker.internal}"
export MINIO_PORT_INTERNAL="${MINIO_PORT_INTERNAL:-9000}"

echo "Starting AutopilotMonster CRM in local development mode"
echo "Backend: ${APP_URL}"
echo "Frontend: http://localhost:${UI_PORT}"
echo "Postgres: localhost:${POSTGRES_PORT}"
echo "Redis: localhost:${REDIS_PORT}"
echo "MinIO API: localhost:${MINIO_API_PORT}"
echo "Adminer: http://localhost:${ADMINER_PORT}"

# Reuse shared infra from staging project and start only dev API
echo "Ensuring shared infra is up (postgres, redis, minio, adminer)..."
docker compose -p autopilot-staging up -d postgres redis minio adminer
echo "Starting dev API container without duplicate infra..."
docker compose -p autopilot-dev up -d --build --no-deps api

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Free the target UI port if another local Next process is occupying it
if lsof -ti :"${UI_PORT}" >/dev/null 2>&1; then
  lsof -ti :"${UI_PORT}" | xargs kill -9 || true
fi

# Run frontend locally with hot reload
exec npm run dev --workspace=apps/ui -- --port "${UI_PORT}"
