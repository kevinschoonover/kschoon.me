import * as grpc from "@grpc/grpc-js";

import { NotificationsClient } from "kschoonme-notifications-pb";

export const notificationsClient = new NotificationsClient(
  `localhost:3010`,
  grpc.credentials.createInsecure()
);
