export interface IConfig {
  API_URI: string;
  CHECKIN_URL: string;
}

const API_URI =
  process.env.NODE_ENV === "development"
    ? "http://localhost"
    : "https://api.kschoon.me";

const config: IConfig = {
  API_URI,
  CHECKIN_URL: `${API_URI}/checkins/`,
};

export { config };
