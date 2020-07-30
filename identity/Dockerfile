FROM node:14.5 AS builder

WORKDIR /usr/src/identity

COPY . .

RUN yarn

RUN yarn run build

FROM builder AS development

CMD yarn start:dev

FROM node:14.5-alpine as production


ENV NODE_ENV=production
WORKDIR /usr/src/identity

COPY package.json ./
COPY yarn.lock ./

USER node

COPY --from=builder /usr/src/identity/node_modules/ node_modules/
COPY --from=builder /usr/src/identity/dist/ dist/

EXPOSE 3009

ENTRYPOINT [ "node", "dist/index.js" ]
