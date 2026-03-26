#!/bin/bash

# ============================================================
# AutopilotMonster CRM — Development Launcher (Standard)
# Runs Frontend (3000) and Backend (4000) in Docker
# ============================================================

set -e

echo "🚀 Starting AutopilotMonster CRM in DEVELOPMENT mode..."

# Default ports for standard dev
export API_PORT=${API_PORT:-4000}
export UI_PORT=${UI_PORT:-3000}
export NODE_ENV=development

echo "📡 API Gateway: http://localhost:$API_PORT"
echo "💻 UI Frontend: http://localhost:$UI_PORT"

# Ensure we are in the root directory
cd "$(dirname "$0")"

# Run docker-compose
docker compose -p autopilot-dev up --build
