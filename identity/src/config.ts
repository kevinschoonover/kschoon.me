export interface IConfig {
  GRPC_PORT: string;
}

export const config: IConfig = {
  GRPC_PORT: process.env.GRPC_PORT || "3009",
};
