FROM node:lts

WORKDIR /app
COPY package*.json ./

RUN apt-get update && apt-get -y install ffmpeg && npm install && mkdir images
COPY dist/ ./

CMD ["node", "--expose-gc", "index.js"]