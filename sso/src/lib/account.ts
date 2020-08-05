import grpc from "@grpc/grpc-js";

import {
  Account as IAccount,
  FindAccount,
  KoaContextWithOIDC,
  AccountClaims,
  Provider,
} from "oidc-provider";

import { UserID, UserProfile } from "kschoonme-identity-pb";

import { Context } from "koa";
import { getUserProfile } from "./grpc";

import { InteractionContext } from "./types";

const store = new Map();
const logins = new Map();

export class Account implements IAccount {
  accountId: string;

  profile?: any;

  constructor(id: string, profile?: any) {
    this.accountId = id;
    this.profile = profile;
    store.set(this.accountId, this);
  }

  /**
   * @param use - can either be "id_token" or "userinfo", depending on
   *   where the specific claims are intended to be put in.
   * @param scope - the intended scope, while oidc-provider will mask
   *   claims depending on the scope automatically you might want to skip
   *   loading some claims from external resources etc. based on this detail
   *   or not return them in id tokens but only userinfo and so on.
   */
  async claims(use: string, scope: string) {
    // eslint-disable-line no-unused-vars
    if (this.profile) {
      return {
        sub: this.accountId, // it is essential to always return a sub claim
        email: this.profile.email,
        email_verified: this.profile.email_verified,
        family_name: this.profile.family_name,
        given_name: this.profile.given_name,
        locale: this.profile.locale,
        name: this.profile.name,
      };
    }

    return {
      sub: this.accountId, // it is essential to always return a sub claim

      address: {
        country: "000",
        formatted: "000",
        locality: "000",
        postal_code: "000",
        region: "000",
        street_address: "000",
      },
      birthdate: "1987-10-16",
      email: "johndoe@example.com",
      email_verified: false,
      family_name: "Doe",
      gender: "male",
      given_name: "John",
      locale: "en-US",
      middle_name: "Middle",
      name: "John Doe",
      nickname: "Johny",
      phone_number: "+49 000 000000",
      phone_number_verified: false,
      picture: "http://lorempixel.com/400/200/",
      preferred_username: "johnny",
      profile: "https://johnswebsite.com",
      updated_at: 1454704946,
      website: "http://example.com",
      zoneinfo: "Europe/Berlin",
    };
  }

  static async findByFederated(provider: string, claims: AccountClaims) {
    const id = `${provider}.${claims.sub}`;
    if (!logins.get(id)) {
      logins.set(id, new Account(id, claims));
    }
    return logins.get(id);
  }

  static async findByLogin(
    ctx: InteractionContext,
    login: string
  ): Promise<UserProfile> {
    const userID: UserID = new UserID();
    userID.setEmail(login);

    const profile = await getUserProfile(userID);
    return profile;
  }

  static findAccount: FindAccount = async (ctx, id, token?) => {
    const userID: UserID = new UserID();
    userID.setId(id);
    const account = getUserProfile(userID);

    return new Account(id, await account);
  };
}
