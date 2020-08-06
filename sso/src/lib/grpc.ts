import { promisify } from "util";

import * as grpc from "@grpc/grpc-js";

import {
  IdentityClient,
  PasswordlessCode,
  UserID,
  PasswordlessResult,
  UserProfile,
} from "kschoonme-identity-pb";

export const client = new IdentityClient(
  `localhost:3009`,
  grpc.credentials.createInsecure()
);

export const sendPasswordlessCode = promisify<UserID, PasswordlessResult>(
  client.sendPasswordlessCode
).bind(client);

export const verifyPasswordlessCode = promisify<
  PasswordlessCode,
  PasswordlessResult
>(client.verifyPasswordlessCode).bind(client);

export const getUserProfile = promisify<UserID, UserProfile>(
  client.getUserProfile
).bind(client);
