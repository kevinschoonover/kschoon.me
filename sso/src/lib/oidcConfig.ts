import { interactionPolicy, Configuration } from "oidc-provider";
import { JSONWebKeySet } from "jose";
import { renderError } from "../helpers/renderError";

import jwks from "../jwks.json";

const { Prompt, base: policy } = interactionPolicy;

// copies the default policy, already has login and consent prompt policies
const interactions = policy();

// create a requestable prompt with no implicit checks
const selectAccount = new Prompt({
  name: "select_account",
  requestable: true,
});

// add to index 0, order goes select_account > login > consent
interactions.add(selectAccount, 0);

export const config: Configuration = {
  clients: [
    {
      client_id: "foo",
      client_secret: "bar",
      redirect_uris: ["http://lvh.me/cb"],
    },
  ],
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
