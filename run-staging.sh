#!/usr/bin/env bash

set -euo pipefail

# Always run from repository root
cd "$(dirname "$0")"

export NODE_ENV="${NODE_ENV:-staging}"
export API_PORT="${API_PORT:-4400}"
export UI_PORT="${UI_PORT:-3300}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export REDIS_PORT="${REDIS_PORT:-6379}"
export MINIO_API_PORT="${MINIO_API_PORT:-9000}"
export MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"
export ADMINER_PORT="${ADMINER_PORT:-8080}"
export APP_PORT=3000
export APP_URL="${APP_URL:-http://localhost:${API_PORT}}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:${API_PORT}}"

# Optionally load dedicated staging values
if [ -f ".env.staging" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.staging"
  set +a
fi

echo "Starting AutopilotMonster CRM in staging docker mode"
echo "Backend: http://localhost:${API_PORT}"
echo "Frontend: http://localhost:${UI_PORT}"

# Continuous/staging-like mode: detached containers with restart behavior from compose defaults
docker compose -p autopilot-staging up -d --build
docker compose -p autopilot-staging ps
