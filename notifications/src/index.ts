import * as grpc from "@grpc/grpc-js";

import notificationsHandler from "./handlers/notifications";

import { config } from "./config";

const { GRPC_PORT } = config;

export const startServer: () => void = (): void => {
  // create a new gRPC server
  const server: grpc.Server = new grpc.Server();

  // register all the handler here...
  server.addService(notificationsHandler.service, {
    ...notificationsHandler.handler,
  });

  // define the host/port for server
  server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null, boundPort: number) => {
      if (err != null) {
        return console.error(err);
      }
      console.log(`gRPC listening on ${boundPort}`);
      return server.start();
    }
  );
};

startServer();
