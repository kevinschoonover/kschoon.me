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
  PasswordlessCode,
  PasswordlessResult,
} from "kschoonme-identity-pb";

import {
  NotificationRequest,
  NotificationResult,
} from "kschoonme-notifications-pb";
import { sendText } from "../lib/grpc";
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
  sendPasswordlessCode = async (
    call: grpc.ServerUnaryCall<UserID, PasswordlessResult>,
    callback: grpc.sendUnaryData<PasswordlessResult>
  ): Promise<void> => {
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

    try {
      const user = await findUser(call.request);
      const request: NotificationRequest = new NotificationRequest();
      request.setNumber(user.phoneNumber);
      request.setBody(authenticator.generate(user.totpSecret));
      await sendText(request);

      const result: PasswordlessResult = new PasswordlessResult();
      result.setCode(PasswordlessResult.ResponseCode.SUCCESS);
      callback(null, result);
    } catch (err) {
      callback(
        {
          code:
            err instanceof NotFoundError
              ? grpc.status.NOT_FOUND
              : grpc.status.INVALID_ARGUMENT,
          message: err,
        },
        null
      );
    }
  };

  verifyPasswordlessCode = async (
    call: grpc.ServerUnaryCall<PasswordlessCode, PasswordlessResult>,
    callback: grpc.sendUnaryData<PasswordlessResult>
  ): Promise<void> => {
    if (!call.request || !call.request?.getUser()) {
      callback(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: `UserID could not be converted to a object`,
        },
        null
      );
      return;
    }

    try {
      const user = await findUser(call.request!.getUser()!);
      const isVerified = authenticator.verify({
        token: call.request!.getCode()!,
        secret: user.totpSecret,
      });

      const result: PasswordlessResult = new PasswordlessResult();
      result.setCode(
        isVerified
          ? PasswordlessResult.ResponseCode.SUCCESS
          : PasswordlessResult.ResponseCode.VERIFICATION_ERROR
      );
      callback(null, result);
    } catch (err) {
      callback(
        {
          code:
            err instanceof NotFoundError
              ? grpc.status.NOT_FOUND
              : grpc.status.INVALID_ARGUMENT,
          message: err,
        },
        null
      );
    }
  };

  updateUser = async (
    call: grpc.ServerUnaryCall<UpdateUserProfile, UserProfile>,
    callback: grpc.sendUnaryData<UserProfile>
  ): Promise<void> => {
    if (!call.request) {
      callback(null, new UserProfile());
      return;
    }

    try {
      const user = await findUser(call.request);
      user.email = call.request!.getEmail() || user.email;
      user.phoneNumber = call.request!.getPhoneNumber() || user.phoneNumber;
      user.givenName = call.request!.getGivenName() || user.givenName;
      user.familyName = call.request!.getFamilyName() || user.familyName;
      user.locale = call.request!.getLocale() || user.locale;
      await user.save();

      callback(null, createUserProfile(user));
    } catch (err) {
      callback(
        {
          code:
            err instanceof NotFoundError
              ? grpc.status.NOT_FOUND
              : grpc.status.INVALID_ARGUMENT,
          message: err,
        },
        null
      );
    }
  };

  createUser = async (
    call: grpc.ServerUnaryCall<CreateUserProfile, UserProfile>,
    callback: grpc.sendUnaryData<UserProfile>
  ): Promise<void> => {
    if (!call.request) {
      callback(null, new UserProfile());
      return;
    }

    const secret = authenticator.generateSecret(); // base32 encoded hex secret key
    const user = new User();
    user.email = call.request.getEmail();
    user.phoneNumber = call.request.getPhoneNumber();
    user.givenName = call.request.getGivenName();
    user.familyName = call.request.getFamilyName();
    user.locale = call.request.getLocale();
    user.totpSecret = authenticator.generate(secret);
    user.totpRecovery = crypto.randomBytes(20).toString("hex");

    try {
      await user.save();
      callback(null, createUserProfile(user));
    } catch (err) {
      let message = "Server Error.";
      let code = grpc.status.INTERNAL;
      if (err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
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
    }
  };

  getUserProfile = async (
    call: grpc.ServerUnaryCall<UserID, UserProfile>,
    callback: grpc.sendUnaryData<UserProfile>
  ): Promise<void> => {
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

    try {
      const user = await findUser(call.request);
      callback(null, createUserProfile(user));
    } catch (err) {
      callback(
        {
          code:
            err instanceof NotFoundError
              ? grpc.status.NOT_FOUND
              : grpc.status.INVALID_ARGUMENT,
          message: err,
        },
        null
      );
    }
  };
}

export default {
  service: IdentityService, // Service interface
  handler: new IdentityHandler(), // Service interface definitions
};
