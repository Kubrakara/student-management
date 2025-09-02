# Geliştirme ortamı için (Daha önceki çözümde Next.js için kullandığımız gibi iki aşamalı build daha iyidir, ancak bu daha basittir.)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]