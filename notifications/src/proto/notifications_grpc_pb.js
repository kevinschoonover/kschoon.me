// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var proto_notifications_pb = require('../proto/notifications_pb.js');

function serialize_notifications_Payload(arg) {
  if (!(arg instanceof proto_notifications_pb.Payload)) {
    throw new Error('Expected argument of type notifications.Payload');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notifications_Payload(buffer_arg) {
  return proto_notifications_pb.Payload.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notifications_Response(arg) {
  if (!(arg instanceof proto_notifications_pb.Response)) {
    throw new Error('Expected argument of type notifications.Response');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notifications_Response(buffer_arg) {
  return proto_notifications_pb.Response.deserializeBinary(new Uint8Array(buffer_arg));
}


var NotificationsService = exports.NotificationsService = {
  sendText: {
    path: '/notifications.Notifications/SendText',
    requestStream: false,
    responseStream: false,
    requestType: proto_notifications_pb.Payload,
    responseType: proto_notifications_pb.Response,
    requestSerialize: serialize_notifications_Payload,
    requestDeserialize: deserialize_notifications_Payload,
    responseSerialize: serialize_notifications_Response,
    responseDeserialize: deserialize_notifications_Response,
  },
};

exports.NotificationsClient = grpc.makeGenericClientConstructor(NotificationsService);
