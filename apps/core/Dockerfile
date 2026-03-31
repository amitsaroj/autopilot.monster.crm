FROM node:20-alpine

# Install dependencies for native modules (e.g., bcrypt, pg)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root configurations (for workspace support if using monorepo)
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies (only at root since it is a workspace)
RUN npm install --legacy-peer-deps

# Copy the core app and any shared libs
COPY apps/core ./apps/core
COPY apps/auth ./apps/auth
COPY libs ./libs

# Expose the API port
EXPOSE 3000

# Build then start backend entrypoint (path differs between environments)
CMD ["sh", "-c", "npm run build && if [ -f dist/apps/core/main.js ]; then node dist/apps/core/main; elif [ -f dist/apps/core/core/src/main.js ]; then node dist/apps/core/core/src/main; else node dist/apps/core/src/main; fi"]
