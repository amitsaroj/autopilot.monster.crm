FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vercel / Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./

# Nextjs needs tailwind/postcss to build
COPY postcss.config.js ./
COPY tailwind.config.ts ./

RUN npm install

COPY src/ ./src/

# Frontend might not have public by default, use conditional copy or make it optional.
# But NextJS build might fail without some configs.
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.ts ./

# Optional: COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
