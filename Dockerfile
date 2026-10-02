FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:full

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production API_HOST=0.0.0.0 API_PORT=3001
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/apps/api/build ./apps/api/build
COPY apps/api/package.json ./apps/api/package.json
USER node
EXPOSE 3001
CMD ["node", "apps/api/build/main.js"]
