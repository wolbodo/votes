FROM node:alpine

COPY build /app

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

EXPOSE 80
ENV PORT=80


RUN npm ci

CMD ["node", "."]
