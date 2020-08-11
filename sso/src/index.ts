import path from "path";

import { Provider } from "oidc-provider";
import helmet from "koa-helmet";
import render from "koa-ejs";
import Redis from "ioredis";
import { Server } from "http";
import serve from "koa-static";
import ratelimit from "koa-ratelimit";

import { config } from "./config";
import { config as oidcConfig } from "./lib/oidcConfig";
import { Account } from "./lib/account";
import { routes } from "./routes";
import { RedisAdapter } from "./lib/redis";

const { ISSUER, PORT } = config;

oidcConfig.findAccount = Account.findAccount;

let server: Server;

(async () => {
  let adapter;
  let db: Redis.Redis | Map<any, any> = new Map();
  if (config.USE_REDIS) {
    adapter = RedisAdapter;
    db = new Redis(config.REDIS_URL);
  }

  const provider = new Provider(ISSUER, { adapter, ...oidcConfig });

  provider.use(helmet());
  provider.use(serve(`${__dirname}/public`));
  provider.use(
    ratelimit({
      driver: config.USE_REDIS ? "redis" : "memory",
      db,
      duration: 60000,
      errorMessage: "Sometimes You Just Have to Slow Down.",
      id: (ctx) => ctx.ip,
      headers: {
        remaining: "Rate-Limit-Remaining",
        reset: "Rate-Limit-Reset",
        total: "Rate-Limit-Total",
      },
      max: 100,
      disableHeader: false,
    })
  );

  if (config.IS_PRODUCTION) {
    provider.proxy = true;
    oidcConfig!.cookies!.short!.secure = true;
    oidcConfig!.cookies!.long!.secure = true;

    provider.use(async (ctx, next) => {
      if (ctx.secure) {
        await next();
      } else if (ctx.method === "GET" || ctx.method === "HEAD") {
        ctx.redirect(ctx.href.replace(/^http:\/\//i, "https://"));
      } else {
        ctx.body = {
          error: "invalid_request",
          error_description: "do yourself a favor and only use https",
        };
        ctx.status = 400;
      }
    });
  }

  render(provider.app, {
    cache: false,
    viewExt: "ejs",
    layout: "_layout",
    root: path.join(__dirname, "views"),
  });
  provider.use(routes(provider).routes());
  server = provider.listen(PORT, () => {
    console.log(
      `application is listening on port ${PORT}, check its /.well-known/openid-configuration`
    );
  });
})().catch((err) => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});
