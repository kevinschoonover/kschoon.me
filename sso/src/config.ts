interface IConfig {
  ISSUER: string;
  PORT: number;
  IS_PRODUCTION: boolean;
}

const { PORT, ISSUER, NODE_ENV } = process.env;

const ISSUER_PORT = PORT || "3000";

export const config: IConfig = {
  ISSUER: ISSUER || `http://localhost:${ISSUER_PORT}`,
  PORT: parseInt(ISSUER_PORT, 10),
  IS_PRODUCTION: NODE_ENV === "production",
};
