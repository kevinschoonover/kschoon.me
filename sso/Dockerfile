FROM node:14.5 AS builder

WORKDIR /usr/src/sso

COPY . .

RUN yarn

RUN yarn run build

FROM builder AS development

CMD yarn start:dev

FROM node:14.5-alpine as production


ENV NODE_ENV=production
WORKDIR /usr/src/sso

COPY package.json ./
COPY yarn.lock ./

USER node

COPY --from=builder /usr/src/sso/node_modules/ node_modules/
COPY --from=builder /usr/src/sso/dist/ dist/

EXPOSE 3000

ENTRYPOINT [ "node", "dist/index.js" ]
