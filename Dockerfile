FROM node:20-alpine AS build

RUN apk add --no-cache ca-certificates openssl
WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force && npm ci --prefer-online

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 4200
