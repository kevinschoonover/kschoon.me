FROM rust:1.44 as rust-base

WORKDIR /usr/src/backend

RUN cargo install diesel_cli --no-default-features --features postgres
RUN cargo install cargo-watch

COPY . .

EXPOSE 8080

VOLUME ["/usr/local/cargo"]

CMD cargo run --release

FROM rust:1.44 as builder

WORKDIR /usr/src/backend

COPY --from=rust-base /usr/local/cargo/bin/diesel /usr/local/cargo/bin/
COPY --from=rust-base /usr/local/cargo/bin/cargo-watch /usr/local/cargo/bin/

COPY . .

RUN cargo build --release
RUN cargo install --path .

# Bundle Stage
FROM debian:bullseye-slim as production

# for connecting to postgres and TLS hosts
RUN apt-get update -y && apt-get install -y libpq-dev openssl libssl1.1 ca-certificates

COPY --from=builder /usr/local/cargo/bin/backend /usr/local/bin/
USER 1000

CMD ["backend"]
