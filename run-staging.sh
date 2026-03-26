#!/bin/bash

# ============================================================
# AutopilotMonster CRM — Development Launcher (Staging/Alt)
# Runs Frontend (3001) and Backend (4001) in Docker
# ============================================================

set -e

echo "🚀 Starting AutopilotMonster CRM in STAGING/ALT mode..."

# Different ports for staging/alt env to allow parallel running
export API_PORT=${API_PORT:-4001}
export UI_PORT=${UI_PORT:-3001}
export NODE_ENV=staging

echo "📡 API Gateway: http://localhost:$API_PORT"
echo "💻 UI Frontend: http://localhost:$UI_PORT"

# Ensure we are in the root directory
cd "$(dirname "$0")"

# Run docker-compose with a different project name
docker compose -p autopilot-staging up --build
