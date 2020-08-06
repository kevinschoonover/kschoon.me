import { promisify } from "util";

import * as grpc from "@grpc/grpc-js";

import {
  NotificationsClient,
  NotificationRequest,
  NotificationResult,
} from "kschoonme-notifications-pb";

export const notificationsClient = new NotificationsClient(
  `localhost:3010`,
  grpc.credentials.createInsecure()
);

export const sendText = promisify<NotificationRequest, NotificationResult>(
  notificationsClient.sendText
).bind(notificationsClient);

