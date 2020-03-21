import pytest
from app import tables


class MockDockerRun:
    id: str = "test"


class MockContainer:
    def __init__(self, status, log_message):
        self.status = status
        self.logs = lambda: log_message.encode("utf-8")


DEFAULT_RESERVATION_CODE = "AAAAAA"
DEFAULT_FIRST_NAME = "Kevin"
DEFAULT_LAST_NAME = "Schoonover"

DEFAULT_STATUS = tables.CheckinStatus.WAITING
FAILED_STATUS = tables.CheckinStatus.FAILED
SUCCESS_STATUS = tables.CheckinStatus.COMPLETED
TEST_CHECKIN = {
    "first_name": DEFAULT_FIRST_NAME,
    "last_name": DEFAULT_LAST_NAME,
    "status": DEFAULT_STATUS,
    "reservation_code": DEFAULT_RESERVATION_CODE,
    "container_id": "test",
    "logs": None,
}

TEST_CHECKIN_SUBMISSION = {
    "first_name": DEFAULT_FIRST_NAME,
    "last_name": DEFAULT_LAST_NAME,
    "reservation_code": DEFAULT_RESERVATION_CODE,
}


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
        test_cases = [
            ("running", "Success!", DEFAULT_STATUS),
            ("running", "Failed!", DEFAULT_STATUS),
            ("exited", "Success!", FAILED_STATUS),
            ("exited", "Failed!", FAILED_STATUS),
            ("exited", "Kevin Schoonover got A5!", SUCCESS_STATUS),
            (
                "exited",
                "Kevin Schoonover got A5!\nKevin Schoonover got B17!",
                SUCCESS_STATUS,
            ),
        ]

        async with async_client as client:
            for docker_status, log, result_status in test_cases:
                patch_docker.containers.get.return_value = MockContainer(
                    docker_status, log
                )
                query = tables.checkins.insert().values(**TEST_CHECKIN)
                db, _ = database
                last_record_id = await db.execute(query)
                response = await client.get(f"/checkins/{last_record_id}")

                assert response.status_code == 200
                assert_json = {
                    **TEST_CHECKIN,
                    "status": result_status.value,
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

    def test_successful_submission(self, sync_client, database, patch_docker):
        patch_docker.containers.run.return_value = MockDockerRun()

        with sync_client as client:
            response = client.post("/checkins/", json=TEST_CHECKIN_SUBMISSION)

            assert response.status_code == 200
            response_json = response.json()
            del response_json["id"]
            assert response_json == {
                **TEST_CHECKIN_SUBMISSION,
                "status": tables.CheckinStatus.WAITING.value,
                "logs": None,
            }

            patch_docker.containers.run.assert_called_with(
                "pyro2927/southwestcheckin:latest",
                [DEFAULT_RESERVATION_CODE, DEFAULT_FIRST_NAME, DEFAULT_LAST_NAME],
                detach=True,
            )

