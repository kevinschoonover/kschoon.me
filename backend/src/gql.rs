use std::net::TcpStream;
use std::sync::{Arc, Mutex};

use async_graphql::connection::{Connection, EmptyFields};
use async_graphql::{Context, FieldResult};
use faktory::{Job, Producer};

use crate::database::Database;
use crate::models;
// use async_graphql::validators::{StringMaxLength, StringMinLength};

pub type Error = Box<dyn std::error::Error + Send + Sync>;

pub struct QueryRoot;

#[async_graphql::Object(cache_control(max_age = 5))]
impl QueryRoot {
    async fn all_checkins(
        &self,
        ctx: &Context<'_>,
        after: Option<String>,
        before: Option<String>,
        first: Option<i32>,
        last: Option<i32>,
    ) -> FieldResult<Connection<String, models::Checkin, EmptyFields, EmptyFields>> {
        models::Checkin::query(ctx, after, before, first, last).await
    }
}

pub struct MutationRoot;

#[async_graphql::Object]
impl MutationRoot {
    async fn create_checkin(
        &self,
        ctx: &Context<'_>,
        new_checkin: models::NewCheckin,
    ) -> FieldResult<models::Checkin> {
        let database = ctx.data::<Database>();
        let mut producer = ctx
            .data::<Arc<Mutex<Producer<TcpStream>>>>()
            .lock()
            .unwrap();
        let checkin = database.create_checkin(new_checkin)?;
        let new_checkin = checkin.clone();
        let job = Job::new(
            "schedule_checkin",
            vec![
                new_checkin.id.to_string(),
                new_checkin.reservation_code,
                new_checkin.first_name,
                new_checkin.last_name,
            ],
        );
        producer.enqueue(job).unwrap();
        Ok(checkin)
    }

    async fn update_checkin_status(
        &self,
        ctx: &Context<'_>,
        id: i32,
        status: models::CheckinStatusEnum,
    ) -> FieldResult<models::Checkin> {
        let database = ctx.data::<Database>();
        Ok(database.update_checkin_status(id, status)?)
    }
}
