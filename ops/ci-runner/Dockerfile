# Monedario isolated CI runner image.
#
# Derived from the verified pcp-ci-isolated image plus the Chromium/Playwright
# system libraries required by the non-blocking accessibility job. Build from
# the REPOSITORY ROOT so the builder can read the lockfile:
#
#   docker build -f ops/ci-runner/Dockerfile -t monedario-ci-isolated:2.338.0-a11y .
#
# The launcher refuses to start if the image is missing (docker image inspect).
#
# Warm pnpm store: bootstrap-pnpm seeds RUNNER_TEMP/pnpm-store from
# /opt/pnpm-store. Without it, a lockfile change forces a cold download of
# ~950 packages (TD-0113; 6-minute installs and timeouts on 2026-11-16).
FROM node:22-bookworm-slim AS pnpm-store
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm config set store-dir /pnpm-store \
  && corepack pnpm fetch --frozen-lockfile

FROM pcp-ci-isolated:2.338.0
COPY --from=pnpm-store /pnpm-store /opt/pnpm-store

USER root
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 \
    libcairo2 libcups2t64 libdbus-1-3 libgbm1 libglib2.0-0t64 \
    libnspr4 libnss3 libpango-1.0-0 libxcb1 libxkbcommon0 \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*
