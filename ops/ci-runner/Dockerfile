# Monedario isolated CI runner image.
#
# Derived from the verified pcp-ci-isolated image plus the Chromium/Playwright
# system libraries required by the non-blocking accessibility job. Build and tag
# it exactly as run-one.sh expects:
#
#   docker build -t monedario-ci-isolated:2.338.0-a11y ops/ci-runner
#
# The launcher refuses to start if the image is missing (docker image inspect).
FROM pcp-ci-isolated:2.338.0

USER root
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 \
    libcairo2 libcups2t64 libdbus-1-3 libgbm1 libglib2.0-0t64 \
    libnspr4 libnss3 libpango-1.0-0 libxcb1 libxkbcommon0 \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*
