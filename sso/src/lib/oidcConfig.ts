import {
  interactionPolicy,
  Configuration,
  KoaContextWithOIDC,
  CanBePromise,
} from "oidc-provider";
import { JSONWebKeySet } from "jose";
import { config as appConfig } from "../config";
import { renderError } from "../helpers/renderError";

let jwks;

if (appConfig.IS_PRODUCTION) {
  jwks = require("../jwks.json");
} else {
  jwks = require("./devJwks.json");
}

const { Prompt, base: policy } = interactionPolicy;

// WARNING: Do NOT add clients to this list that are not first-party clients as
// they allow you to bypass consent checks.
const firstPartyClients = [
  {
    client_id: "foo",
    client_secret: "bar",
    redirect_uris: ["http://lvh.me/cb"],
  },
];

const firstPartyClientIds = new Set(
  firstPartyClients.map((client) => client.client_id)
);

// copies the default policy, already has login and consent prompt policies
const interactions = policy();
const consentPrompt = interactions.get("consent")!;
consentPrompt.checks.get("client_not_authorized")!.check = (
  ctx: KoaContextWithOIDC
): CanBePromise<boolean> => {
  const { oidc } = ctx;
  const { clientId } = oidc.client!;
  oidc.session!.ensureClientContainer(oidc.client!.clientId);
  if (firstPartyClientIds.has(clientId)) {
    oidc.session!.promptedScopesFor(
      oidc.params!.client_id,
      oidc.requestParamScopes
    );
    oidc.session!.promptedClaimsFor(
      oidc.params!.client_id,
      oidc.requestParamClaims
    );

    return false;
  }

  if (oidc.session!.sidFor(clientId)) {
    return false;
  }

  return true;
};

consentPrompt.checks.get("scopes_missing")!.check = (
  ctx: KoaContextWithOIDC
): CanBePromise<boolean> => {
  const { oidc } = ctx;
  const { clientId } = oidc.client!;
  oidc.session!.ensureClientContainer(oidc.client!.clientId);
  const promptedScopes = oidc.session!.promptedScopesFor(clientId);

  if (firstPartyClientIds.has(clientId)) {
    oidc.session!.promptedScopesFor(
      oidc.params!.client_id,
      oidc.requestParamScopes
    );
    oidc.session!.promptedClaimsFor(
      oidc.params!.client_id,
      oidc.requestParamClaims
    );
    return false;
  }

  for (const scope of oidc.requestParamScopes) {
    // eslint-disable-line no-restricted-syntax
    if (!promptedScopes.has(scope)) {
      return true;
    }
  }

  return false;
};

export const config: Configuration = {
  clients: firstPartyClients,
  interactions: {
    policy: interactions,
    url(ctx, interaction) {
      // eslint-disable-line no-unused-vars
      return `/interaction/${ctx.oidc.uid}`;
    },
  },
  cookies: {
    long: { signed: true, maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day in ms
    short: { signed: true },
    keys: [
      "some secret key",
      "and also the old rotated away some time ago",
      "and one more",
    ],
  },
  claims: {
    email: ["email", "email_verified"],
    phone: ["phone_number", "phone_number_verified"],
    profile: ["family_name", "given_name", "locale", "updated_at"],
  },
  features: {
    devInteractions: { enabled: false }, // defaults to true
    deviceFlow: { enabled: true }, // defaults to false
    introspection: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
  },
  jwks: jwks as JSONWebKeySet,
  ttl: {
    AccessToken: 1 * 60 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 1 * 60 * 60, // 1 hour in seconds
    DeviceCode: 10 * 60, // 10 minutes in seconds
    RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds
  },
  renderError,
};
