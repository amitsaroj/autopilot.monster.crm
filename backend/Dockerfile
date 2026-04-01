FROM node:20-alpine AS builder

# Install dependencies for native modules (e.g., bcrypt, pg)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root configurations
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies cleanly
RUN npm install

# Copy source code
COPY src/ ./src/

# Compile the application (nest build -> dist/main.js)
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ---
# Production Image
# ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and production runtime dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 8000

# Copy startup sequence allowing automated prestart (seed execution)
COPY package*.json ./
CMD ["npm", "run", "start"]
