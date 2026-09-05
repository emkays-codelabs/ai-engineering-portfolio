FROM node:20-alpine AS base

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so they
# must be passed as build args (not just runtime env) — see docker-compose.yml.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

# ---- Runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# next.config.ts sets output: "standalone", so the build produces a
# self-contained server.js plus only the node_modules it actually needs.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
