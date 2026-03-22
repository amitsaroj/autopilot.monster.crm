FROM node:20-alpine

# Install dependencies for native modules (e.g., bcrypt, pg)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root configurations (for workspace support if using monorepo)
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (only at root since it is a workspace)
RUN npm install

# Copy the core app and any shared libs
COPY apps/core ./apps/core
# Check if there's a libs directory
# COPY libs ./libs

# Expose the API port
EXPOSE 3000

# Start in development mode (assumes 'apps/core' has 'start:dev' script or root has it)
# Given NestJS workspace structure, usually: nest start core --watch
CMD ["npm", "run", "start:dev", "--prefix", "apps/core"]
