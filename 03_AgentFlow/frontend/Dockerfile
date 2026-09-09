# AgentFlow frontend image: multi-stage build so the production container
# serves the compiled static bundle through nginx, never the Vite dev server.
#
# Author: Mahesh Kumar
# Founder & CEO, SaffronyxAI.in
# Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

# --- build stage -------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Dependency layer cached separately from source.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables at build time, so this must be a build ARG,
# not a runtime env var. Defaults to the backend's docker-compose host port;
# override with --build-arg VITE_API_URL=... for a different deployment.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN node node_modules/vite/bin/vite.js build

# --- serve stage --------------------------------------------------------
FROM nginx:1.27-alpine AS serve

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
