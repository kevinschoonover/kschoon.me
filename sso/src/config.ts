interface IConfig {
  ISSUER: string;
  PORT: number;
}

const { PORT, ISSUER } = process.env;

const ISSUER_PORT = PORT || "3000";

export const config: IConfig = {
  ISSUER: ISSUER || `http://localhost:${ISSUER_PORT}`,
  PORT: parseInt(ISSUER_PORT, 10),
};
