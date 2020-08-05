import { promisify } from "util";

import * as grpc from "@grpc/grpc-js";

import {
  NotificationsClient,
  Payload,
  Response,
} from "kschoonme-notifications-pb";

export const notificationsClient = new NotificationsClient(
  `localhost:3010`,
  grpc.credentials.createInsecure()
);

export const sendText = promisify<Payload, Response>(
  notificationsClient.sendText
).bind(notificationsClient);

