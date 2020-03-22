from unittest.mock import MagicMock

import databases
import docker
import pytest

from app import helpers, tables

from . import defaults
from . import helpers as test_helpers


def mock_observe_container(
    db: databases.Database, status: tables.CheckinStatus, logs: str
):
    async def observe_container(
        db: databases.Database, id: int, container: docker.models.containers.Container
    ):
        await helpers.update_checkin(db, id, status, logs)

    return observe_container


def test_redocs(sync_client, database):
    with sync_client as client:
        response = client.get("/")
        assert response.status_code == 200
        assert b"Auto Check-in - ReDoc" in response.content


class TestListingCheckins:
    def test_listing_empty_database(self, sync_client, database):
        with sync_client as client:
            response = client.get("/checkins/")
            assert response.status_code == 200
            assert response.json() == []


class TestSpecificCheckins:
    def test_showing_empty_database(self, sync_client, database):
        with sync_client as client:
            response = client.get("/checkins/100000/")
            assert response.status_code == 404
            assert response.json() == {"detail": "Check-in not found"}

    @pytest.mark.asyncio
    async def test_showing_real_checkin(self, async_client, database, patch_docker):
        async with async_client as client:
            query = tables.checkins.insert().values(**defaults.TEST_CHECKIN)
            db, _ = database
            last_record_id = await db.execute(query)
            response = await client.get(f"/checkins/{last_record_id}")

            assert response.status_code == 200
            assert_json = {
                **defaults.TEST_CHECKIN,
                "status": defaults.DEFAULT_STATUS.value,
                "id": last_record_id,
            }
            del assert_json["container_id"]
            assert response.json() == assert_json


class TestCreatingCheckins:
    def test_validation_error_on_incomplete_submission(self, sync_client, database):
        with sync_client as client:
            response = client.post("/checkins/")
            assert response.status_code == 422
            assert response.json() == {
                "detail": [
                    {
                        "loc": ["body", "checkin"],
                        "msg": "field required",
                        "type": "value_error.missing",
                    }
                ]
            }

            response = client.post("/checkins/", json={"first_name": "Kevin"})
            assert response.status_code == 422
            assert response.json() == {
                "detail": [
                    {
                        "loc": ["body", "checkin", "last_name"],
                        "msg": "field required",
                        "type": "value_error.missing",
                    },
                    {
                        "loc": ["body", "checkin", "reservation_code"],
                        "msg": "field required",
                        "type": "value_error.missing",
                    },
                ]
            }

    def test_successful_submission_and_update(
        self, sync_client, database, patch_docker, monkeypatch
    ):
        patch_docker.containers.run.return_value = test_helpers.MockContainer(
            tables.CheckinStatus.WAITING, "Success!"
        )

        with sync_client as client:
            test_cases = [
                (tables.CheckinStatus.FAILED, "Sucess!"),
                (tables.CheckinStatus.COMPLETED, "Failed!"),
            ]
            db, _ = database

            for status, logs in test_cases:
                monkeypatch.setattr(
                    "app.helpers.observe_container",
                    mock_observe_container(db, status, logs),
                )
                response = client.post(
                    "/checkins/", json=defaults.TEST_CHECKIN_SUBMISSION
                )

                assert response.status_code == 200
                response_json = response.json()
                id = response_json["id"]
                del response_json["id"]
                assert response_json == {
                    **defaults.TEST_CHECKIN_SUBMISSION,
                    "status": tables.CheckinStatus.WAITING.value,
                    "logs": None,
                }

                patch_docker.containers.run.assert_called_with(
                    "pyro2927/southwestcheckin:latest",
                    [
                        defaults.DEFAULT_RESERVATION_CODE,
                        defaults.DEFAULT_FIRST_NAME,
                        defaults.DEFAULT_LAST_NAME,
                    ],
                    detach=True,
                )

                # Check that it gets updated after the fact
                response = client.get(f"/checkins/{id}")
                response_json = response.json()
                del response_json["id"]
                assert response_json == {
                    **defaults.TEST_CHECKIN_SUBMISSION,
                    "status": status.value,
                    "logs": logs,
                }
