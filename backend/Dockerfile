FROM rust:1.44

WORKDIR /usr/src/backend

RUN cargo install diesel_cli --no-default-features --features postgres
RUN cargo install cargo-watch

COPY . .

EXPOSE 8080

VOLUME ["/usr/local/cargo"]

CMD cargo run --release
