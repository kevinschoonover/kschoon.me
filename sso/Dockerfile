FROM node:14.5 AS builder
WORKDIR /usr/src/sso

COPY ./yarn.lock ./package.json ./
RUN yarn

COPY ./nodemon.json ./tsconfig.json ./
COPY ./src/ ./src/


FROM builder AS development
CMD yarn start:dev


FROM builder as production-shim
ENV NODE_ENV=production
WORKDIR /usr/src/sso

RUN yarn build


FROM node:14.5-alpine as production
USER node
ENV NODE_ENV=production
WORKDIR /usr/src/sso

COPY package.json yarn.lock tsconfig.json ./

COPY --from=production-shim /usr/src/sso/node_modules/ node_modules/
COPY --from=production-shim /usr/src/sso/dist/ dist/

EXPOSE 3000

ENTRYPOINT [ "node", "dist/index.js" ]
