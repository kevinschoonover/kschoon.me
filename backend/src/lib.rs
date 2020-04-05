#![warn(clippy::all)]

#[macro_use]
extern crate diesel;
extern crate dotenv;

pub mod database;
pub mod gql;
pub mod models;
// pub mod routes;
pub mod schema;
