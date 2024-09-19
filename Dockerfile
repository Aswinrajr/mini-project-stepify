FROM node:alpine3.18

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 1999

CMD ["npm", "start"]
