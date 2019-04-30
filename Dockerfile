FROM node:lts-alpine

WORKDIR /app
COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps make gcc g++ python \
 && npm install \
 && apk del .build-deps
COPY dist/ ./

CMD ["node", "index.js"]