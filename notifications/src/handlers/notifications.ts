import * as grpc from "@grpc/grpc-js";

import twilio from "twilio";

import { config } from "../config";
import { Response, Payload } from "../proto/notifications_pb";
import {
  INotificationsServer,
  NotificationsService,
} from "../proto/notifications_grpc_pb";

const { TWILIO_ACCOUNT_ID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER } = config;

const twilioClient = twilio(TWILIO_ACCOUNT_ID, TWILIO_AUTH_TOKEN);

class NotificationsHandler implements INotificationsServer {
  sendText = (
    call: grpc.ServerUnaryCall<Payload, Response>,
    callback: grpc.sendUnaryData<Response>
  ): void => {
    const request = call.request?.toObject();
    const reply: Response = new Response();

    reply.setSuccess(false);
    reply.setBody("Unexpected error occurred.");

    if (!request) {
      callback(null, reply);
      return;
    }

    twilioClient.messages
      .create({
        body: request.body,
        to: request.number,
        from: TWILIO_NUMBER,
      })
      .then(() => {
        reply.setSuccess(true);
        reply.setBody("Notification sent!");
      })
      .catch((error) => {
        reply.setBody(`Notification failed to be set with error: ${error}`);
      })
      .finally(() => {
        callback(null, reply);
      });
  };
}

export default {
  service: NotificationsService, // Service interface
  handler: new NotificationsHandler(), // Service interface definitions
};
