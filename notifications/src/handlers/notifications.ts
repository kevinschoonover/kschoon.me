import * as grpc from "@grpc/grpc-js";

import twilio from "twilio";

import {
  NotificationResult,
  NotificationRequest,
  INotificationsServer,
  NotificationsService,
} from "kschoonme-notifications-pb";
import { config } from "../config";

const { TWILIO_ACCOUNT_ID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER } = config;

const twilioClient = twilio(TWILIO_ACCOUNT_ID, TWILIO_AUTH_TOKEN);

class NotificationsHandler implements INotificationsServer {
  sendText = (
    call: grpc.ServerUnaryCall<NotificationRequest, NotificationResult>,
    callback: grpc.sendUnaryData<NotificationResult>
  ): void => {
    const request = call.request?.toObject();
    const result: NotificationResult = new NotificationResult();

    result.setCode(NotificationResult.ResponseCode.INTERNAL_ERROR);
    result.setReason("Unexpected error occurred.");

    if (!request) {
      callback(null, result);
      return;
    }

    twilioClient.messages
      .create({
        body: request.body,
        to: request.number,
        from: TWILIO_NUMBER,
      })
      .then(() => {
        result.setCode(NotificationResult.ResponseCode.SUCCESS);
      })
      .catch((error) => {
        result.setReason(`Notification failed to be set with error: ${error}`);
      })
      .finally(() => {
        callback(null, result);
      });
  };
}

export default {
  service: NotificationsService, // Service interface
  handler: new NotificationsHandler(), // Service interface definitions
};
