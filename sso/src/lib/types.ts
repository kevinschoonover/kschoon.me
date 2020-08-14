import { DefaultState, ParameterizedContext, Context } from "koa";
import { IdentityClient } from "kschoonme-identity-pb";

export type InteractionState = DefaultState;
export type InteractionContext = Context & { grpcClient: IdentityClient };
