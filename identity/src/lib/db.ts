import { ConnectionOptions } from "typeorm";
import { config } from "../config";

const params: { ssl: boolean } = { ssl: false };

const [url, unparsedParams] = config.POSTGRES_URL.split("?");

unparsedParams?.split("&").forEach((values) => {
  const [key, value] = values.split("=");
  if (key === "ssl") {
    params.ssl = value === "true" || params.ssl;
  } else if (key === "sslmode") {
    params.ssl = value === "required" || params.ssl;
  }
});

export = {
  type: "postgres",
  url,
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
  entities: [`${__dirname}/../resources/**/index{.js,.ts}`],
  migrations: [`${__dirname}/../migrations/**/*{.js,.ts}`],
  subscribers: [`${__dirname}/../subscribers/**/*{.js.ts}`],
  extra: {
    ssl: params.ssl,
  },
  cli: {
    entitiesDir: `${__dirname}/../entities`,
    migrationsDir: `${__dirname}/../migrations`,
    subscribersDir: `${__dirname}/../subscribers`,
  },
} as ConnectionOptions;
