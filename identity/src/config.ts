export interface IConfig {
  GRPC_PORT: string;
  POSTGRES_URL: string;
}

const { GRPC_PORT, POSTGRES_URL } = process.env;

export const config: IConfig = {
  GRPC_PORT: GRPC_PORT || "3009",
  POSTGRES_URL: POSTGRES_URL || "postgresql://postgres:postgres@localhost",
};
