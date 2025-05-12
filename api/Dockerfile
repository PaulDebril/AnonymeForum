FROM node:18-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
LABEL org.opencontainers.image.source="https://github.com/PaulDebril/AnonymeForum"
