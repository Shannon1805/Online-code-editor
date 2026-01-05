FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y g++

EXPOSE 5000

CMD ["node", "server.js"]

