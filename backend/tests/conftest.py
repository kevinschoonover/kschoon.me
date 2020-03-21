import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import create_database

from unittest.mock import MagicMock


class MockDockerRun:
    id = "test"


@pytest.fixture
def patch_docker(monkeypatch):
    mock = MagicMock()
    mock.containers = MagicMock()
    mock.containers.run.return_value = MockDockerRun()
    monkeypatch.setattr("app.main.client", mock)
    return mock


@pytest.fixture
def database(monkeypatch):
    created_db = create_database(force_rollback=True)
    return monkeypatch.setattr("app.main.database", created_db)


@pytest.fixture(scope="module")
def test_app():
    client = TestClient(app)
    yield client  # testing happens here
