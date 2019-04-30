FROM node:lts

WORKDIR /app
COPY package*.json ./

RUN apt-get install ffmpeg && npm install && mkdir images
COPY dist/ ./

CMD ["node", "index.js"]