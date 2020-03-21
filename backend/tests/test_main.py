from app.tables import CheckinStatus


def test_redocs(test_app, database):
    with test_app as client:
        response = client.get("/")
        assert response.status_code == 200
        assert b"Auto Check-in - ReDoc" in response.content


class TestListingCheckins:
    def test_listing_empty_database(self, test_app, database):
        with test_app as client:
            response = client.get("/checkins/")
            assert response.status_code == 200
            assert response.json() == []


class TestSpecificCheckins:
    def test_showing_empty_database(self, test_app, database):
        with test_app as client:
            response = client.get("/checkins/100000/")
            assert response.status_code == 404
            assert response.json() == {"detail": "Check-in not found"}


class TestCreatingCheckins:
    def test_validation_error_on_incomplete_submission(self, test_app, database):
        with test_app as client:
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

    def test_successful_submission(self, test_app, database, patch_docker):
        test_data = {
            "reservation_code": "AAAAAA",
            "first_name": "Kevin",
            "last_name": "Schoonover",
        }

        with test_app as client:
            response = client.post("/checkins/", json=test_data)

            assert response.status_code == 200
            response_json = response.json()
            del response_json["id"]
            assert response_json == {
                **test_data,
                "status": CheckinStatus.WAITING.value,
            }

            patch_docker.containers.run.assert_called_with("hello-world", detach=True)

