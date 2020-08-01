import * as grpc from "@grpc/grpc-js";

import * as crypto from "crypto";

import { authenticator } from "otplib";

import {
  UserProfile,
  CreateUserProfile,
  UpdateUserProfile,
  UserID,
  IIdentityServer,
  IdentityService,
} from "kschoonme-identity-pb";

import { User } from "../resources/User";
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from "../consts";

function createUserProfile(user: User): UserProfile {
  const reply = new UserProfile();
  reply.setId(user.id);
  reply.setEmail(user.email);
  reply.setEmailVerified(user.emailVerified);
  reply.setPhoneNumber(user.phoneNumber);
  reply.setPhoneNumberVerified(user.phoneNumberVerified);
  reply.setGivenName(user.givenName);
  reply.setFamilyName(user.familyName);
  if (user.locale) {
    reply.setLocale(user.locale);
  }

  return reply;
}

class IdentityHandler implements IIdentityServer {
  updateUser = (
    call: grpc.ServerUnaryCall<UpdateUserProfile, UserProfile>,
    callback: grpc.sendUnaryData<UserProfile>
  ): void => {
    if (!call.request) {
      callback(null, new UserProfile());
      return;
    }

    User.findOne(call.request.getId())
      .then((user) => {
        if (!user) {
          throw new Error("User not found");
        }
        user.email = call.request!.getEmail() || user.email;
        user.phoneNumber = call.request!.getPhoneNumber() || user.phoneNumber;
        user.givenName = call.request!.getGivenName() || user.givenName;
        user.familyName = call.request!.getFamilyName() || user.familyName;
        user.locale = call.request!.getLocale() || user.locale;

        return user;
      })
      .then((user) => {
        return user.save();
      })
      .then((user) => {
        callback(null, createUserProfile(user));
      })
      .catch((reason) => {
        throw new Error(reason);
      });
  };

  createUser = (
    call: grpc.ServerUnaryCall<CreateUserProfile, UserProfile>,
    callback: grpc.sendUnaryData<UserProfile>
  ): void => {
    if (!call.request) {
      callback(null, new UserProfile());
      return;
    }

    const secret = authenticator.generateSecret(); // base32 encoded hex secret key
    const token = authenticator.generate(secret);
    const recoveryCode = crypto.randomBytes(20).toString("hex");
    const user = new User();
    user.email = call.request.getEmail();
    user.phoneNumber = call.request.getPhoneNumber();
    user.givenName = call.request.getGivenName();
    user.familyName = call.request.getFamilyName();
    user.locale = call.request.getLocale();
    user.totpSecret = token;
    user.totpRecovery = recoveryCode;
    user
      .save()
      .then((savedUser) => {
        callback(null, createUserProfile(savedUser));
      })
      .catch((error) => {
        let message = "Server Error.";
        let code = grpc.status.INTERNAL;
        if (error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
          message = "User already exists.";
          code = grpc.status.ALREADY_EXISTS;
        }
        callback(
          {
            message,
            code,
          },
          null
        );
      });
  };

  getUserProfile = (
    call: grpc.ServerUnaryCall<UserID, UserProfile>,
    callback: grpc.sendUnaryData<UserProfile>
  ): void => {
    const userIdObject = call.request?.toObject();
    let findOne;
    let errorMsg: string;

    if (!userIdObject) {
      callback(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: `UserID could not be converted to a object`,
        },
        null
      );

      return;
    }

    if (userIdObject.id) {
      const { id } = userIdObject;
      findOne = User.findOne(userIdObject.id);
      errorMsg = `Could not find user with ID=${id}`;
    } else if (userIdObject.email) {
      const { email } = userIdObject;
      findOne = User.findOne({ email: userIdObject.email });
      errorMsg = `Could not find user with email=${email}`;
    } else {
      callback(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: `Neither ID or Email is specified in the input.`,
        },
        null
      );

      return;
    }

    findOne.then((user) => {
      if (!user) {
        callback(
          {
            code: grpc.status.NOT_FOUND,
            message: errorMsg,
          },
          null
        );
        return;
      }

      callback(null, createUserProfile(user));
    });
  };
}

export default {
  service: IdentityService, // Service interface
  handler: new IdentityHandler(), // Service interface definitions
};
