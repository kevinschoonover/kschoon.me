import * as grpc from "@grpc/grpc-js";

import { IdentityClient } from "kschoonme-identity-pb";

export const client = new IdentityClient(
  `localhost:3009`,
  grpc.credentials.createInsecure()
);
