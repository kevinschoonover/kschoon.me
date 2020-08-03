/* eslint-disable no-console, max-len, camelcase, no-unused-vars */
import { strict as assert } from "assert";

import { promisify, inspect } from "util";
import querystring from "querystring";
import crypto from "crypto";

import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import { Provider, errors } from "oidc-provider";

import { UserID, Result, PasswordlessCode } from "kschoonme-identity-pb";

import { client as grpcClient } from "./lib/grpcClient";
import { InteractionContext, InteractionState } from "./lib/types";
import { renderError } from "./lib/renderError";
import { Account } from "./lib/account";

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
      case "select_account": {
        if (!session) {
          return provider.interactionFinished(
            ctx.req,
            ctx.res,
            {
              select_account: {},
            },
            { mergeWithLastSubmission: false }
          );
        }

        const account = await provider.Account.findAccount(
          ctx as any,
          session.accountId as string
        );
        const { email } = await account.claims(
          "prompt",
          "email",
          { email: null },
          []
        );

        return ctx.render("select_account", {
          client,
          uid,
          email,
          details: prompt.details,
          params,
          title: "Sign-in",
          session: session ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt),
          },
        });
      }
      case "login": {
        return ctx.render("login", {
          client,
          uid,
          details: prompt.details,
          params,
          title: "Sign-in",
          google: ctx.google,
          session: session ? debug(session) : undefined,
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

  router.get("/interaction/callback/google", (ctx) =>
    ctx.render("repost", { provider: "google", layout: false })
  );

  router.post("/interaction/:uid/login", body, async (ctx) => {
    const { uid, params, session, prompt } = await provider.interactionDetails(
      ctx.req,
      ctx.res
    );
    const path = `/interaction/${uid}/verify`;
    ctx.assert(prompt.name === "login", 500);

    const client = await provider.Client.find(params.client_id);
    try {
      ctx.state.affectedAccount = await Account.findByLogin(
        ctx,
        ctx.request.body.login
      );

      ctx.cookies.set("accountId", ctx.state.affectedAccount.getId(), {
        path,
        maxAge: 1000 * 120,
        sameSite: "strict",
      });

      if (!ctx.state.affectedAccount) {
        ctx.throw(400, new Error("User not found"));
        return;
      }
    } catch (error) {
      ctx.throw(400, new Error("User not found"));
      return;
    }

    const userId = new UserID();
    userId.setEmail(ctx.request.body.login);
    const sendPasswordlessCode = promisify<UserID, Result>(
      grpcClient.sendPasswordlessCode
    ).bind(grpcClient);

    await sendPasswordlessCode(userId);

    return ctx.render("2fa", {
      client,
      uid,
      params,
      title: "2fa",
      session: session ? debug(session) : undefined,
      dbg: {
        params: debug(params),
        prompt: debug(prompt),
      },
    });
  });

  router.post("/interaction/:uid/verify", body, async (ctx) => {
    const accountId = ctx.cookies.get("accountId");
    ctx.assert(accountId, 500);

    const {
      params,
      prompt: { name },
    } = await provider.interactionDetails(ctx.req, ctx.res);
    ctx.assert(name === "login", 500);

    const passwordlessCode = new PasswordlessCode();
    passwordlessCode.setCode(ctx.request.body?.code);
    const userId = new UserID();
    userId.setId(accountId!);
    passwordlessCode.setUser(userId);
    const verifyPasswordlessCode = promisify<PasswordlessCode, Result>(
      grpcClient.verifyPasswordlessCode
    ).bind(grpcClient);

    const verificationResult = await verifyPasswordlessCode(passwordlessCode);
    verificationResult.toObject();

    let result;

    if (verificationResult.getCode() === Result.ResponseCode.SUCCESS) {
      result = {
        select_account: {}, // make sure its skipped by the interaction policy since we just logged in
        login: {
          account: accountId!,
        },
      };
    } else {
      result = {
        select_account: {},
        // an error field used as error code indicating a failure during the interaction
        error: "invalid_code",

        // an optional description for this error
        error_description: "Code verification failed. Please retry login.",
      };
    }

    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  router.post("/interaction/:uid/federated", body, async (ctx) => {
    const {
      prompt: { name },
    } = await provider.interactionDetails(ctx.req, ctx.res);
    assert.equal(name, "login");

    const path = `/interaction/${ctx.params.uid}/federated`;

    switch (ctx.request.body.provider) {
      case "google": {
        const callbackParams = ctx.google.callbackParams(ctx.req);

        // init
        if (!Object.keys(callbackParams).length) {
          const state = `${ctx.params.uid}|${crypto
            .randomBytes(32)
            .toString("hex")}`;
          const nonce = crypto.randomBytes(32).toString("hex");

          ctx.cookies.set("google.state", state, { path, sameSite: "strict" });
          ctx.cookies.set("google.nonce", nonce, { path, sameSite: "strict" });

          return ctx.redirect(
            ctx.google.authorizationUrl({
              state,
              nonce,
              scope: "openid email profile",
            })
          );
        }

        // callback
        const state = ctx.cookies.get("google.state");
        ctx.cookies.set("google.state", "", { path });
        const nonce = ctx.cookies.get("google.nonce");
        ctx.cookies.set("google.nonce", "", { path });

        const tokenset = await ctx.google.callback(undefined, callbackParams, {
          state,
          nonce,
          response_type: "id_token",
        });
        const account = await Account.findByFederated(
          "google",
          tokenset.claims()
        );

        const result = {
          select_account: {}, // make sure its skipped by the interaction policy since we just logged in
          login: {
            account: account.accountId,
          },
        };
        return provider.interactionFinished(ctx.req, ctx.res, result, {
          mergeWithLastSubmission: false,
        });
      }
      default:
        return undefined;
    }
  });

  router.post("/interaction/:uid/continue", body, async (ctx) => {
    const interaction = await provider.interactionDetails(ctx.req, ctx.res);
    const {
      prompt: { name, details },
    } = interaction;
    assert.equal(name, "select_account");

    if (ctx.request.body.switch) {
      if (interaction.params.prompt) {
        const prompts = new Set(interaction.params.prompt.split(" "));
        prompts.add("login");
        interaction.params.prompt = [...prompts].join(" ");
      } else {
        interaction.params.prompt = "login";
      }
      await interaction.save();
    }

    const result = { select_account: {} };
    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  });

  router.post("/interaction/:uid/confirm", body, async (ctx) => {
    const {
      prompt: { name, details },
    } = await provider.interactionDetails(ctx.req, ctx.res);
    assert.equal(name, "consent");

    const consent: any = {};

    // any scopes you do not wish to grant go in here
    //   otherwise details.scopes.new.concat(details.scopes.accepted) will be granted
    consent.rejectedScopes = [];

    // any claims you do not wish to grant go in here
    //   otherwise all claims mapped to granted scopes
    //   and details.claims.new.concat(details.claims.accepted) will be granted
    consent.rejectedClaims = [];

    // replace = false means previously rejected scopes and claims remain rejected
    // changing this to true will remove those rejections in favour of just what you rejected above
    consent.replace = false;

    const result = { consent };
    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: true,
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
