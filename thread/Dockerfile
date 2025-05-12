# Étape 1 : build de l’app
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Étape 2 : serveur NGINX pour servir l’app
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
LABEL org.opencontainers.image.source="https://github.com/PaulDebril/AnonymeForum"
