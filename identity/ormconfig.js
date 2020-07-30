const IS_PROD = process.env.NODE_ENV === "production";
const ROOT_DIR = IS_PROD ? "dist" : "src";

module.exports = {
  type: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_TABLE || "postgres",
  port: process.env.DB_PORT || 5432,
  logging: ["error", "warning"],
  logger: "advanced-console",
  cache: true,
  // See src/main.ts as to why these are all false
  // Should we automatically synchronize our database?
  synchronize: false,
  // Run migrations automatically,
  migrationsRun: false,
  // Should we automatically drop the entire database on start?
  dropSchema: false,
  entities: [`${ROOT_DIR}/resources/**/index{.js,.ts}`],
  migrations: [`${ROOT_DIR}/migrations/**/*{.js,.ts}`],
  subscribers: [`${ROOT_DIR}/subscribers/**/*{.js.ts}`],
  cli: {
    entitiesDir: `${ROOT_DIR}/entities`,
    migrationsDir: `${ROOT_DIR}/migrations`,
    subscribersDir: `${ROOT_DIR}/subscribers`
  },
  // ssl: IS_PROD ? true : false
};
