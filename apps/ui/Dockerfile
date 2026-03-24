FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/ui ./apps/ui
COPY libs ./libs

RUN npm install --legacy-peer-deps

WORKDIR /app/apps/ui
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/ui/.next ./apps/ui/.next
COPY --from=builder /app/apps/ui/package.json ./apps/ui/package.json
COPY --from=builder /app/apps/ui/next.config.mjs ./apps/ui/next.config.mjs

WORKDIR /app/apps/ui
EXPOSE 3001

CMD ["npm", "start", "--", "-p", "3001"]
