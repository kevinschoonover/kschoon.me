FROM node:14.5 AS builder
WORKDIR /usr/src/identity

COPY ./yarn.lock ./package.json ./
RUN yarn

COPY ./nodemon.json ./tsconfig.json ./
COPY ./src/ ./src/


FROM builder AS development
CMD yarn start:dev


FROM builder as production-shim
ENV NODE_ENV=production
WORKDIR /usr/src/identity

RUN yarn build


FROM node:14.5-alpine as production
USER node
ENV NODE_ENV=production
WORKDIR /usr/src/identity

COPY package.json yarn.lock tsconfig.json ./

COPY --from=production-shim /usr/src/identity/node_modules/ node_modules/
COPY --from=production-shim /usr/src/identity/dist/ dist/

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
