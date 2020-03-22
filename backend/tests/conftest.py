from unittest.mock import MagicMock

import databases
import docker
import pytest
from async_asgi_testclient import TestClient as AsyncTestClient
from fastapi.testclient import TestClient

from app import helpers, tables
from app.database import create_database
from app.main import app


@pytest.fixture
def patch_docker(monkeypatch):
    mock = MagicMock()
    mock.containers = MagicMock()
    mock.reload = MagicMock()

    monkeypatch.setattr("app.main.client", mock)
    return mock


@pytest.fixture
def database(monkeypatch):
    created_db = create_database(force_rollback=True)
    return created_db, monkeypatch.setattr("app.main.database", created_db)


# Useful for testing functions that don't require the full application to be
# running
@pytest.fixture
async def connected_db(monkeypatch):
    created_db = create_database(force_rollback=True)
    await created_db.connect()
    yield created_db
    await created_db.disconnect()


@pytest.fixture(scope="module")
def sync_client():
    client = TestClient(app)
    yield client  # testing happens here


# The async client is necessary when I want to insert something in the database
# using encode/databases because the standard Starlette / FastAPI TestClient
# does not support for asynchronous context manager i.e.:
# `async with TestClient(app) as client:` that is necessary to run the client in
# a async def function. This can potentially change by the test client being
# updated in starlette using httpx. Tracked at https://github.com/encode/starlette/issues/652
@pytest.fixture(scope="function")
async def async_client():
    client = AsyncTestClient(app)
    yield client
