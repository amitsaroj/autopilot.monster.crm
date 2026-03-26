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

# Start in development mode
CMD ["npm", "run", "dev:core"]
