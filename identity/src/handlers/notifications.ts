import * as grpc from "@grpc/grpc-js";

import * as crypto from "crypto";

import { authenticator } from "otplib";
import { promisify } from "util";

import {
  UserProfile,
  CreateUserProfile,
  UpdateUserProfile,
  UserID,
  IIdentityServer,
  IdentityService,
  PasswordlessCode,
  Result,
} from "kschoonme-identity-pb";

import { notificationsClient } from "src/lib/grpc";
import { Payload, Response } from "kschoonme-notifications-pb";
import { NotFoundError, InvalidArgumentError } from "../errors";
import { User } from "../resources/User";
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from "../consts";

async function findUser(userID: UserID): Promise<User> {
  const { id, email } = userID.toObject();
  let findOne;
  let errorMsg = "Neither email or ID specified in UserID";

  if (id) {
    findOne = User.findOne(id);
    errorMsg = `Could not find user with id=${id}`;
  } else if (email) {
    findOne = User.findOne({ email });
    errorMsg = `Could not find user with email=${email}`;
  } else {
    throw new InvalidArgumentError(errorMsg);
  }

  const user = await findOne;

  if (!user) {
    throw new NotFoundError(errorMsg);
  }

  return user;
}

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
  sendPasswordlessCode = (
    call: grpc.ServerUnaryCall<UserID, Result>,
    callback: grpc.sendUnaryData<Result>
  ): void => {
    if (!call.request) {
      callback(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: `UserID could not be converted to a object`,
        },
        null
      );
      return;
    }

    findUser(call.request)
      .then((user) => {
        const token = authenticator.generate(user.totpSecret);
        const payload: Payload = new Payload();
        const result: Result = new Result();
        const sendText = promisify<Payload, Response>(
          notificationsClient.sendText
        ).bind(notificationsClient);
        payload.setNumber(user.phoneNumber);
        payload.setBody(token);
        result.setCode(Result.ResponseCode.SUCCESS);
        callback(null, result);
        return sendText(payload);
      })
      .catch((reason) => {
        callback(
          {
            code:
              reason instanceof NotFoundError
                ? grpc.status.NOT_FOUND
                : grpc.status.INVALID_ARGUMENT,
            message: reason,
          },
          null
        );
      });
  };

  verifyPasswordlessCode = (
    call: grpc.ServerUnaryCall<PasswordlessCode, Result>,
    callback: grpc.sendUnaryData<Result>
  ): void => {
    if (!call.request || !call.request.getUser()) {
      callback(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: `UserID could not be converted to a object`,
        },
        null
      );
      return;
    }

    findUser(call.request!.getUser()!)
      .then((user) => {
        const isVerified = authenticator.verify({
          token: call.request!.getCode()!,
          secret: user.totpSecret,
        });

        console.log(call.request!.getCode()!, isVerified);

        const result: Result = new Result();
        result.setCode(
          isVerified
            ? Result.ResponseCode.SUCCESS
            : Result.ResponseCode.VERIFICATION_ERROR
        );
        callback(null, result);
      })
      .catch((reason) => {
        callback(
          {
            code:
              reason instanceof NotFoundError
                ? grpc.status.NOT_FOUND
                : grpc.status.INVALID_ARGUMENT,
            message: reason,
          },
          null
        );
      });
  };

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
    if (!call.request) {
      callback(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: `UserID could not be converted to a object`,
        },
        null
      );

      return;
    }

    findUser(call.request)
      .then((user) => {
        callback(null, createUserProfile(user));
      })
      .catch((reason) => {
        callback(
          {
            code:
              reason instanceof NotFoundError
                ? grpc.status.NOT_FOUND
                : grpc.status.INVALID_ARGUMENT,
            message: reason,
          },
          null
        );
      });
  };
}

export default {
  service: IdentityService, // Service interface
  handler: new IdentityHandler(), // Service interface definitions
};
