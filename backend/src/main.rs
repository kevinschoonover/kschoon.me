#![warn(clippy::all)]

use std::convert::Infallible;
use std::env;
use std::sync::{Arc, Mutex};

use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use async_graphql::{EmptySubscription, QueryBuilder, Schema};
use async_graphql_warp::{BadRequest, GQLResponse};
use dotenv::dotenv;
use http::StatusCode;
use warp::{http::Response, Filter, Rejection};

use backend::database::Database;
use backend::gql;

use faktory::Producer;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").unwrap();

    std::env::set_var("RUST_LOG", "warp_server");
    env_logger::init();

    let db = Database::new(&database_url).unwrap();
    let faktory_producer = Arc::new(Mutex::new(Producer::connect(None).unwrap()));

    let schema = Schema::build(gql::QueryRoot, gql::MutationRoot, EmptySubscription)
        .data(db)
        .data(faktory_producer)
        .finish();

    println!("Playground: http://localhost:8080");

    let graphql_post = async_graphql_warp::graphql(schema).and_then(
        |(schema, builder): (_, QueryBuilder)| async move {
            let resp = builder.execute(&schema).await;
            Ok::<_, Infallible>(GQLResponse::from(resp))
        },
    );

    let graphql_playground = warp::path::end().and(warp::get()).map(|| {
        Response::builder()
            .header("content-type", "text/html")
            .body(playground_source(GraphQLPlaygroundConfig::new("/")))
    });

    let cors = warp::cors()
        .allow_credentials(true)
        .allow_any_origin()
        .allow_headers(vec!["authorization", "content-type"])
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE"]);

    let routes = graphql_post
        .or(graphql_playground)
        .recover(|err: Rejection| async move {
            if let Some(BadRequest(err)) = err.find() {
                return Ok::<_, Infallible>(warp::reply::with_status(
                    err.to_string(),
                    StatusCode::BAD_REQUEST,
                ));
            }

            Ok(warp::reply::with_status(
                "INTERNAL_SERVER_ERROR".to_string(),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        })
        .with(cors);

    warp::serve(routes).run(([0, 0, 0, 0], 8080)).await;
}
