import os

import databases
import sqlalchemy

POSTGRES_DB: str = os.environ.get("POSTGRES_DB", "postgres")
POSTGRES_HOST: str = os.environ.get("POSTGRES_HOST", "localhost")
POSTGRES_USER: str = os.environ.get("POSTGRES_USER", "postgres")
POSTGRES_PASS: str = os.environ.get("POSTGRES_PASS", "postgres")

DATABASE_URL: str = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASS}@{POSTGRES_HOST}/{POSTGRES_DB}"
)


def create_database(force_rollback=False) -> databases.Database:
    return databases.Database(DATABASE_URL, force_rollback=force_rollback)


database: databases.Database = create_database()

metadata: sqlalchemy.MetaData = sqlalchemy.MetaData()

engine = sqlalchemy.create_engine(DATABASE_URL)
