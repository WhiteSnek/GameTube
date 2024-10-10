FROM node:latest

ARG VITE_SERVER

ENV VITE_SERVER=$VITE_SERVER

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
