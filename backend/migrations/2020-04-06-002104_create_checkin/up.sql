-- Your SQL goes here
CREATE TYPE CheckinStatus AS ENUM ('FAILED', 'SCHEDULED', 'WAITING', 'COMPLETED');

CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    reservation_code VARCHAR(6) NOT NULL,
    status CheckinStatus default 'WAITING' NOT NULL,
    logs TEXT NULL
)
