export interface IConfig {
  GRPC_PORT: string;
  IS_PRODUCTION: boolean;
  POSTGRES_URL: string;
}

const { GRPC_PORT, POSTGRES_URL, NODE_ENV } = process.env;

const IS_PRODUCTION: boolean = NODE_ENV === "production";

export const config: IConfig = {
  GRPC_PORT: GRPC_PORT || "3009",
  IS_PRODUCTION,
  POSTGRES_URL: POSTGRES_URL || "postgresql://postgres:postgres@localhost",
};
