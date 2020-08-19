import { ConnectionOptions } from "typeorm";
import { config } from "../config";

export = {
  type: "postgres",
  url: config.POSTGRES_URL || "postgres://postgres:postgres@db:5432",
  logging: ["error", "warn"],
  logger: "advanced-console",
  ssl: config.POSTGRES_USE_SSL,
  cache: true,
  // See src/main.ts as to why these are all false
  // Should we automatically synchronize our database?
  synchronize: false,
  // Run migrations automatically,
  migrationsRun: false,
  // Should we automatically drop the entire database on start?
  dropSchema: false,
  entities: [`${__dirname}/../resources/**/index{.js,.ts}`],
  migrations: [`${__dirname}/../migrations/**/*{.js,.ts}`],
  subscribers: [`${__dirname}/../subscribers/**/*{.js.ts}`],
  cli: {
    entitiesDir: `${__dirname}/../entities`,
    migrationsDir: `${__dirname}/../migrations`,
    subscribersDir: `${__dirname}/../subscribers`,
  },
  // ssl: IS_PROD ? true : false
} as ConnectionOptions;
