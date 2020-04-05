table! {
    use diesel::sql_types::*;
    use crate::models::{CheckinStatus as Checkinstatus};

    checkins (id) {
        id -> Int4,
        first_name -> Varchar,
        last_name -> Varchar,
        reservation_code -> Varchar,
        status -> Checkinstatus,
        logs -> Nullable<Text>,
    }
}
