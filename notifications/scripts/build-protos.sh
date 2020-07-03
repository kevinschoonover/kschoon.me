#!/usr/bin/env sh

OUT_DIR="./dist"
TS_OUT_DIR="./src"
IN_DIR="./proto"
PROTOC="$(yarn bin)/grpc_tools_node_protoc"
PROTOC_GEN_TS="$(yarn bin)/protoc-gen-ts"

mkdir -p "$OUT_DIR"
mkdir -p "$TS_OUT_DIR"

$PROTOC \
    -I="./" \
    --plugin=protoc-gen-ts=$PROTOC_GEN_TS \
    --js_out=import_style=commonjs:$TS_OUT_DIR \
    --grpc_out=grpc_js:$TS_OUT_DIR \
    --ts_out=generate_package_definition:$TS_OUT_DIR \
    "$IN_DIR"/*.proto

# sed -i "" -e \
#     "s/require('grpc')/require('@grpc\/grpc-js')/g" \
#     "$OUT_DIR/$IN_DIR/"*
# 
# sed -i "" -e \
#     "s/from \"grpc\"/from \"@grpc\/grpc-js\"/g" \
#     "$TS_OUT_DIR/$IN_DIR/"*
