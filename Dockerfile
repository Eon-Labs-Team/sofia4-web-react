FROM node:20-bookworm-slim AS build

RUN apk add --no-cache ca-certificates openssl
WORKDIR /app

COPY package*.json ./

RUN npm ci --prefer-online --no-audit --no-fund

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 4200
