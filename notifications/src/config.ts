export interface IConfig {
  TWILIO_ACCOUNT_ID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_NUMBER: string;
  GRPC_PORT: string;
}

export const config: IConfig = {
  TWILIO_ACCOUNT_ID:
    process.env.TWILIO_ACCOUNT_ID || "ACe8bb53cab44a3ebbfbb37a7d5b13064a",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "TESTING",
  TWILIO_NUMBER: process.env.TWILIO_NUMBER || "+12057758087",
  GRPC_PORT: process.env.GRPC_PORT || "3010",
};
