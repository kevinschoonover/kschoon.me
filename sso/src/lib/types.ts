import { DefaultState, ParameterizedContext, Context } from "koa";
import { IdentityClient } from "kschoonme-identity-pb";

export type InteractionContext = DefaultState;
export type InteractionState = Context & { grpcClient: IdentityClient };
