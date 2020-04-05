use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, CustomizeConnection, Pool, PooledConnection};

use crate::models;
use crate::schema::checkins as checkins_table;

pub type PgPool = Pool<ConnectionManager<PgConnection>>;
pub type PgPooledConnection = PooledConnection<ConnectionManager<PgConnection>>;
pub type Error = Box<dyn std::error::Error + Send + Sync>;

pub struct Database {
    pool: PgPool,
}

#[derive(Debug)]
struct TestTransaction;

impl CustomizeConnection<PgConnection, ::diesel::r2d2::Error> for TestTransaction {
    fn on_acquire(
        &self,
        conn: &mut PgConnection,
    ) -> ::std::result::Result<(), ::diesel::r2d2::Error> {
        conn.begin_test_transaction().unwrap();
        Ok(())
    }
}

impl Database {
    pub fn new(database_url: &str) -> Result<Database, Error> {
        let manager = ConnectionManager::<PgConnection>::new(database_url);
        let pool = if !cfg!(test) {
            Pool::builder().build(manager)?
        } else {
            Pool::builder()
                .max_size(1)
                .connection_customizer(Box::new(TestTransaction))
                .build(manager)?
        };

        let db = Database { pool };
        Ok(db)
    }

    pub fn create_checkin(
        &self,
        new_checkin: models::NewCheckin,
    ) -> Result<models::Checkin, Error> {
        let conn = self.pool.get()?;
        let checkin: models::Checkin = diesel::insert_into(checkins_table::table)
            .values(&new_checkin)
            .get_result(&conn)?;
        Ok(checkin)
    }

    pub fn update_checkin_status(
        &self,
        id: i32,
        status: models::CheckinStatusEnum,
    ) -> Result<models::Checkin, Error> {
        let conn = self.pool.get()?;
        let target = checkins_table::table.filter(checkins_table::id.eq(id));
        let checkin = diesel::update(target)
            .set(checkins_table::status.eq(status))
            .get_result::<models::Checkin>(&conn)?;
        Ok(checkin)
    }

    pub fn get_checkins_count(&self) -> Result<i64, Error> {
        let conn = self.pool.get()?;
        let count = checkins_table::table.count().get_result(&conn)?;

        Ok(count)
    }

    pub fn get_checkins(&self) -> Result<Vec<models::Checkin>, Error> {
        let conn = self.pool.get()?;
        let checkins = checkins_table::table
            .order_by(checkins_table::id.asc())
            .load::<models::Checkin>(&conn)?;
        return Ok(checkins);
    }
}
