interface IConfig {
  ISSUER: string;
  PORT: number;
  IS_PRODUCTION: boolean;
  REDIS_URL: string;
  USE_REDIS: boolean;
}

const { PORT, ISSUER, NODE_ENV, REDIS_URL, USE_REDIS } = process.env;

const ISSUER_PORT = PORT || "3000";
const IS_PRODUCTION: boolean = NODE_ENV === "production";

export const config: IConfig = {
  ISSUER: ISSUER || `http://localhost:${ISSUER_PORT}`,
  PORT: parseInt(ISSUER_PORT, 10),
  IS_PRODUCTION,
  REDIS_URL: REDIS_URL || "redis://redis:6379/",
  USE_REDIS: IS_PRODUCTION || USE_REDIS === "true",
};
