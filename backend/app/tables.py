import enum

import sqlalchemy

from .database import metadata


class CheckinStatus(enum.Enum):
    FAILED = "FAILED"
    COMPLETED = "COMPLETED"
    WAITING = "WAITING"


checkins = sqlalchemy.Table(
    "checkins",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("reservation_number", sqlalchemy.String),
    sqlalchemy.Column("first_name", sqlalchemy.String),
    sqlalchemy.Column("last_name", sqlalchemy.String),
)
