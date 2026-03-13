FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY public ./public
COPY src ./src
COPY server.js ./

RUN npm run build

EXPOSE 3000

CMD ["node", "server.js"]
