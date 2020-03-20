import os

import databases
import sqlalchemy

POSTGRES_DB = os.environ.get("POSTGRES_DB", "app")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "db")
POSTGRES_USER = os.environ.get("POSTGRES_USER", "app")
POSTGRES_PASS = os.environ.get("POSTGRES_PASS", "app")

DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASS}@{POSTGRES_HOST}/{POSTGRES_DB}"
)

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

engine = sqlalchemy.create_engine(DATABASE_URL)
