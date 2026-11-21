# Container for stdio clients and for the Glama build, which runs security checks
# against the image.
#
# The Echoteka server itself does NOT run in this image: it is hosted at
# https://echoteka.ai/mcp. The image contains only the bridge that turns the
# client's stdio protocol into HTTP calls to that server. Stdio clients without
# Docker can use `npx -y mcp-remote https://echoteka.ai/mcp` instead.
FROM node:22-alpine

WORKDIR /app

# Built from the repository sources, not from the published package, so the
# image is produced the same way the Glama builder produces it. `npm ci` uses
# the exact versions pinned in package-lock.json.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY bin ./bin
COPY README.md LICENSE ./

# Default: the anonymous endpoint. Analysis, artifact cleanup, previews, job
# status and the free daily master need no account, so the MCP handshake works
# in an automated build. The sign-in endpoint needs a person in a browser:
# -e ECHOTEKA_MCP_URL=https://echoteka.ai/mcp/oauth
ENV ECHOTEKA_MCP_URL=https://echoteka.ai/mcp

# Unprivileged user: the container only talks outbound over HTTPS.
USER node

ENTRYPOINT ["node", "bin/echoteka-mcp.js"]
