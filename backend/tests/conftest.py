import pytest
from fastapi.testclient import TestClient
from async_asgi_testclient import TestClient as AsyncTestClient


from app.main import app
from app.database import create_database

from unittest.mock import MagicMock


class MockDockerRun:
    id: str = "test"


class MockContainer:
    logs = lambda: b"Success!"
    status: str = "running"


@pytest.fixture
def patch_docker(monkeypatch):
    mock = MagicMock()
    mock.containers = MagicMock()
    mock.containers.get.return_value = MockContainer()
    mock.containers.run.return_value = MockDockerRun()
    monkeypatch.setattr("app.main.client", mock)
    return mock


@pytest.fixture
def database(monkeypatch):
    created_db = create_database(force_rollback=True)
    return created_db, monkeypatch.setattr("app.main.database", created_db)


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
