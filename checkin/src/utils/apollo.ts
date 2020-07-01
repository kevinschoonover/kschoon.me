import ApolloClient from "apollo-boost";
import { config } from "../config";

export const client = new ApolloClient({
  uri: config.CHECKIN_URL,
});
