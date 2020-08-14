/* eslint-disable no-console, max-len, camelcase, no-unused-vars */
import { strict as assert } from "assert";

import { inspect } from "util";
import querystring from "querystring";
import crypto from "crypto";

import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import { Provider, errors } from "oidc-provider";

import {
  UserID,
  PasswordlessResult,
  PasswordlessCode,
} from "kschoonme-identity-pb";

import { config } from "./config";
import { verifyPasswordlessCode, sendPasswordlessCode } from "./lib/grpc";
import { InteractionContext, InteractionState } from "./lib/types";
import { renderError } from "./helpers/renderError";
import { Account } from "./lib/account";
import { decrementRetries } from "./lib/retry";

const keys = new Set();
const debug = (obj: any) =>
  querystring.stringify(
    Object.entries(obj).reduce((acc, [key, value]) => {
      keys.add(key);
      if (!value) return acc;
      acc[key] = inspect(value, { depth: null });
      return acc;
    }, {}),
    "<br/>",
    ": ",
    {
      encodeURIComponent(value) {
        return keys.has(value) ? `<strong>${value}</strong>` : value;
      },
    }
  );

export const routes: (provider: Provider) => Router = (provider: Provider) => {
  const router = new Router<InteractionState, InteractionContext>();

  router.use(async (ctx, next) => {
    ctx.set("Pragma", "no-cache");
    ctx.set("Cache-Control", "no-cache, no-store");
    try {
      await next();
    } catch (err) {
      if (err instanceof errors.SessionNotFound) {
        ctx.status = err.status;
        const { message: error, error_description } = err;
        renderError(ctx, { error, error_description }, err);
      } else {
        throw err;
      }
    }
  });

  router.get("/interaction/:uid", async (ctx, next) => {
    const { uid, prompt, params, session } = await provider.interactionDetails(
      ctx.req,
      ctx.res
    );
    const client = await provider.Client.find(params.client_id);

    switch (prompt.name) {
      case "login": {
        return ctx.render("login", {
          client,
          uid,
          details: prompt.details,
          params,
          title: "Sign-in",
          google: ctx.google,
          session: session ? debug(session) : undefined,
          error: null,
          email: null,
          IS_PRODUCTION: config.IS_PRODUCTION,
          dbg: {
            params: debug(params),
            prompt: debug(prompt),
          },
        });
      }
      case "consent": {
        return ctx.render("interaction", {
          client,
          uid,
          details: prompt.details,
          params,
          title: "Authorize",
          error: null,
          IS_PRODUCTION: config.IS_PRODUCTION,
          session: session ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt),
          },
        });
      }
      default:
        return next();
    }
  });

  const body = bodyParser();

  router.post("/interaction/:uid/login", body, async (ctx) => {
    const { uid, params, session, prompt } = await provider.interactionDetails(
      ctx.req,
      ctx.res
    );
    const path = `/interaction/${uid}/verify`;
    const client = await provider.Client.find(params.client_id);

    ctx.assert(prompt.name === "login", 500);

    try {
      const account = await Account.findByLogin(ctx, ctx.request.body.login);

      if (!account) {
        throw new Error("User not found");
      }

      ctx.cookies.set("accountId", account.getId(), {
        path,
        maxAge: 1000 * 120,
        sameSite: "strict",
      });
    } catch (error) {
      return ctx.render("login", {
        client,
        uid,
        details: prompt.details,
        params,
        title: "Sign-in",
        google: ctx.google,
        session: session ? debug(session) : undefined,
        email: ctx.request.body.login,
        error: "User was not found. Did you spell it right?",
        IS_PRODUCTION: config.IS_PRODUCTION,
        dbg: {
          params: debug(params),
          prompt: debug(prompt),
        },
      });
    }

    const userId = new UserID();
    userId.setEmail(ctx.request.body.login);

    await sendPasswordlessCode(userId);

    return ctx.render("2fa", {
      client,
      uid,
      params,
      title: "Sign-in",
      error: null,
      code: null,
      session: session ? debug(session) : undefined,
      IS_PRODUCTION: config.IS_PRODUCTION,
      dbg: {
        params: debug(params),
        prompt: debug(prompt),
      },
    });
  });

  router.post("/interaction/:uid/verify", body, async (ctx) => {
    const {
      session,
      uid,
      params,
      prompt,
      prompt: { name },
    } = await provider.interactionDetails(ctx.req, ctx.res);
    const client = await provider.Client.find(params.client_id);

    const path = `/interaction/${uid}/verify`;
    const accountId = ctx.cookies.get("accountId");

    ctx.assert(accountId, 500);
    ctx.assert(name === "login", 500);

    const passwordlessCode = new PasswordlessCode();
    passwordlessCode.setCode(ctx.request.body?.code);
    const userId = new UserID();
    userId.setId(accountId!);
    passwordlessCode.setUser(userId);

    const verificationResult = await verifyPasswordlessCode(passwordlessCode);
    verificationResult.toObject();

    let result;

    if (
      verificationResult.getCode() === PasswordlessResult.ResponseCode.SUCCESS
    ) {
      result = {
        select_account: {}, // make sure its skipped by the interaction policy since we just logged in
        login: {
          account: accountId!,
        },
      };
    } else {
      try {
        decrementRetries(ctx, uid);

        return ctx.render("2fa", {
          client,
          uid,
          params,
          title: "2fa",
          error: "Could not verify code. Is it typed correctly?",
          code: ctx.request.body?.code,
          session: session ? debug(session) : undefined,
          IS_PRODUCTION: config.IS_PRODUCTION,
          dbg: {
            params: debug(params),
            prompt: debug(prompt),
          },
        });
      } catch (err) {
        result = {
          select_account: {},
          // an error field used as error code indicating a failure during the interaction
          error: "invalid_code",

          // an optional description for this error
          error_description:
            "Code verification failed after 3 retries. Please retry login.",
        };
      }
    }

    ctx.cookies.set("accountId", "", {
      path,
      maxAge: 1000 * 120,
      sameSite: "strict",
    });

    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  router.get("/interaction/:uid/abort", async (ctx) => {
    const result = {
      error: "access_denied",
      error_description: "End-User aborted interaction",
    };

    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  return router;
};
