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
WORKDIR /usr/src/sso
# The UID and GID are hardcoded in the ansible variables in order to make the
# jwks.json not readable by any other user. Be sure to change that if you change
# these.
RUN addgroup --gid 1005 --system kschoon_api && adduser --uid 1005 --system --no-create-home --ingroup kschoon_api kschoon_api

ENV NODE_ENV=production
USER kschoon_api

COPY package.json yarn.lock tsconfig.json ./

COPY --from=production-shim /usr/src/sso/node_modules/ node_modules/
COPY --from=production-shim /usr/src/sso/dist/ dist/

EXPOSE 3000
CMD [ "node", "dist/index.js" ]
