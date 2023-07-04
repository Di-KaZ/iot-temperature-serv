FROM node:18.3.0-alpine3.14

# Create app directory
CMD mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./front/* .

RUN npm install && \
    npm run build

ENTRYPOINT ["npm", "run", "start"]