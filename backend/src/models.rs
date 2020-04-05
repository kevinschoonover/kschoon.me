use crate::database::Database;
use crate::schema::checkins;

use async_graphql::connection::{query, Connection, Edge, EmptyFields};
use async_graphql::validators::{StringMaxLength, StringMinLength};
use async_graphql::{Context, FieldResult};
use diesel::deserialize::{self, FromSql};
use diesel::pg::Pg;
use diesel::serialize::{self, IsNull, Output, ToSql};
use std::io::Write;

#[derive(SqlType)]
#[postgres(type_name = "CHECKIN_STATUS")]
pub struct CheckinStatus;

#[async_graphql::Enum]
#[derive(Debug, FromSqlRow, AsExpression)]
#[sql_type = "CheckinStatus"]
pub enum CheckinStatusEnum {
    WAITING,
    COMPLETED,
    FAILED,
}

impl ToSql<CheckinStatus, Pg> for CheckinStatusEnum {
    fn to_sql<W: Write>(&self, out: &mut Output<W, Pg>) -> serialize::Result {
        match *self {
            CheckinStatusEnum::WAITING => out.write_all(b"WAITING")?,
            CheckinStatusEnum::COMPLETED => out.write_all(b"COMPLETED")?,
            CheckinStatusEnum::FAILED => out.write_all(b"FAILED")?,
        }
        Ok(IsNull::No)
    }
}

impl FromSql<CheckinStatus, Pg> for CheckinStatusEnum {
    fn from_sql(bytes: Option<&[u8]>) -> deserialize::Result<Self> {
        match not_none!(bytes) {
            b"WAITING" => Ok(CheckinStatusEnum::WAITING),
            b"COMPLETED" => Ok(CheckinStatusEnum::COMPLETED),
            b"FAILED" => Ok(CheckinStatusEnum::FAILED),
            not_implemented => unimplemented!(
                "Unrecognized CheckinStatus variant: {}",
                String::from_utf8_lossy(not_implemented)
            ),
        }
    }
}

#[async_graphql::SimpleObject]
#[derive(Queryable, AsExpression, Identifiable, Clone, PartialEq, Eq, Debug)]
pub struct Checkin {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub reservation_code: String,
    pub checkin_status: CheckinStatusEnum,
    pub log: Option<String>,
}

impl Checkin {
    pub async fn query(
        ctx: &Context<'_>,
        after: Option<String>,
        before: Option<String>,
        first: Option<i32>,
        last: Option<i32>,
    ) -> FieldResult<Connection<String, Checkin, EmptyFields, EmptyFields>> {
        query(
            after,
            before,
            first,
            last,
            |after, before, first, last| async move {
                let database = ctx.data::<Database>();
                let checkin_nodes = database.get_checkins()?;

                // TODO: we probably dont need this generic logic
                // as the id and cursor should map 1-to-1
                let start_idx = after
                    .and_then(|cursor| {
                        checkin_nodes
                            .clone()
                            .into_iter()
                            .position(|node| node.id.to_string() == cursor)
                            .map(|idx| idx + 1)
                    })
                    .unwrap_or(0);
                let end_idx = before
                    .and_then(|cursor| {
                        checkin_nodes
                            .clone()
                            .into_iter()
                            .rposition(|node| node.id.to_string() == cursor)
                    })
                    .unwrap_or(checkin_nodes.len());

                let mut has_previous_page = start_idx > 0;
                let mut has_next_page = end_idx < checkin_nodes.len();

                let mut nodes = &checkin_nodes[start_idx..end_idx];

                if let Some(first) = first {
                    if nodes.len() > first {
                        let slice_begin = 0;
                        let slice_end = first;
                        nodes = &nodes[slice_begin..slice_end];
                        // TODO: need to check this
                        has_next_page = true;
                    }
                }

                if let Some(last) = last {
                    if nodes.len() > last {
                        let slice_begin = nodes.len() - last;
                        let slice_end = nodes.len();
                        nodes = &nodes[slice_begin..slice_end];
                        // TODO: need to check this
                        has_previous_page = true;
                    }
                }

                let mut edges = vec![];

                for node in nodes {
                    edges.push(Edge::new(node.id.to_string(), node.to_owned()));
                }

                let mut connection = Connection::new(has_previous_page, has_next_page);
                connection.append(edges);

                Ok(connection)
            },
        )
        .await
    }
}

#[async_graphql::InputObject]
#[table_name = "checkins"]
#[derive(Clone, Debug, Insertable)]
pub struct NewCheckin {
    pub first_name: String,
    pub last_name: String,
    #[field(validator(and(StringMinLength(length = "6"), StringMaxLength(length = "6"))))]
    pub reservation_code: String,
}
