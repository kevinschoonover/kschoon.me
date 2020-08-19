export interface IConfig {
  GRPC_PORT: string;
  IS_PRODUCTION: boolean;
  POSTGRES_URL: string;
  POSTGRES_USE_SSL: boolean;
}

const { GRPC_PORT, POSTGRES_URL, NODE_ENV, POSTGRES_USE_SSL } = process.env;

const IS_PRODUCTION: boolean = NODE_ENV === "production";

export const config: IConfig = {
  GRPC_PORT: GRPC_PORT || "3009",
  IS_PRODUCTION,
  POSTGRES_URL: POSTGRES_URL || "postgresql://postgres:postgres@localhost",
  POSTGRES_USE_SSL: IS_PRODUCTION || POSTGRES_USE_SSL === "true",
};
