// package: notifications
// file: proto/notifications.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import {handleClientStreamingCall} from "@grpc/grpc-js/build/src/server-call";
import * as proto_notifications_pb from "../proto/notifications_pb";

interface INotificationsService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sendText: INotificationsService_ISendText;
}

interface INotificationsService_ISendText extends grpc.MethodDefinition<proto_notifications_pb.Payload, proto_notifications_pb.Response> {
    path: string; // "/notifications.Notifications/SendText"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<proto_notifications_pb.Payload>;
    requestDeserialize: grpc.deserialize<proto_notifications_pb.Payload>;
    responseSerialize: grpc.serialize<proto_notifications_pb.Response>;
    responseDeserialize: grpc.deserialize<proto_notifications_pb.Response>;
}

export const NotificationsService: INotificationsService;

export interface INotificationsServer {
    sendText: grpc.handleUnaryCall<proto_notifications_pb.Payload, proto_notifications_pb.Response>;
}

export interface INotificationsClient {
    sendText(request: proto_notifications_pb.Payload, callback: (error: grpc.ServiceError | null, response: proto_notifications_pb.Response) => void): grpc.ClientUnaryCall;
    sendText(request: proto_notifications_pb.Payload, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: proto_notifications_pb.Response) => void): grpc.ClientUnaryCall;
    sendText(request: proto_notifications_pb.Payload, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: proto_notifications_pb.Response) => void): grpc.ClientUnaryCall;
}

export class NotificationsClient extends grpc.Client implements INotificationsClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public sendText(request: proto_notifications_pb.Payload, callback: (error: grpc.ServiceError | null, response: proto_notifications_pb.Response) => void): grpc.ClientUnaryCall;
    public sendText(request: proto_notifications_pb.Payload, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: proto_notifications_pb.Response) => void): grpc.ClientUnaryCall;
    public sendText(request: proto_notifications_pb.Payload, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: proto_notifications_pb.Response) => void): grpc.ClientUnaryCall;
}
