import enum

import sqlalchemy

from .database import metadata


class CheckinStatus(enum.Enum):
    FAILED = "FAILED"
    COMPLETED = "COMPLETED"
    WAITING = "WAITING"


checkins: sqlalchemy.Table = sqlalchemy.Table(
    "checkins",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("first_name", sqlalchemy.String),
    sqlalchemy.Column("last_name", sqlalchemy.String),
    sqlalchemy.Column("reservation_code", sqlalchemy.String),
    sqlalchemy.Column("status", sqlalchemy.Enum(CheckinStatus)),
    sqlalchemy.Column("container_id", sqlalchemy.String),
    sqlalchemy.Column("logs", sqlalchemy.String, nullable=True),
)
