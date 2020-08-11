import * as grpc from "@grpc/grpc-js";

import { createConnection } from "typeorm";
import identityHandler from "./handlers/identity";

import { config } from "./config";

const { GRPC_PORT } = config;

async function startServer() {
  // create a new gRPC server
  const server: grpc.Server = new grpc.Server();

  // register all the handler here...
  server.addService(identityHandler.service, {
    ...identityHandler.handler,
  });

  const connection = await createConnection({
    type: "postgres",
    url: config.POSTGRES_URL || "postgres://postgres:postgres@db:5432",
    logging: ["error", "warn"],
    logger: "advanced-console",
    cache: true,
    // See src/main.ts as to why these are all false
    // Should we automatically synchronize our database?
    synchronize: false,
    // Run migrations automatically,
    migrationsRun: false,
    // Should we automatically drop the entire database on start?
    dropSchema: false,
    entities: [`${__dirname}/resources/**/index{.js,.ts}`],
    migrations: [`${__dirname}/migrations/**/*{.js,.ts}`],
    subscribers: [`${__dirname}/subscribers/**/*{.js.ts}`],
    cli: {
      entitiesDir: `${__dirname}/entities`,
      migrationsDir: `${__dirname}/migrations`,
      subscribersDir: `${__dirname}/subscribers`,
    },
    // ssl: IS_PROD ? true : false
  });
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
