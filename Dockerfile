FROM node:22-alpine AS builder
WORKDIR /app
# Override NODE_ENV so devDependencies (tsc, tsx) are installed
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Keys persist via mounted volume at /app/.keys
RUN addgroup -S vantage && adduser -S vantage -G vantage && mkdir -p .keys && chown -R vantage:vantage /app
USER vantage
EXPOSE 3100
CMD ["node", "dist/index.js"]
