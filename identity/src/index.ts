import * as grpc from "@grpc/grpc-js";

import { createConnection } from "typeorm";
import notificationsHandler from "./handlers/notifications";

import { config } from "./config";

const { GRPC_PORT } = config;

async function startServer() {
  // create a new gRPC server
  const server: grpc.Server = new grpc.Server();

  // register all the handler here...
  server.addService(notificationsHandler.service, {
    ...notificationsHandler.handler,
  });

  const connection = await createConnection();
  await connection.runMigrations();

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
}

startServer();
