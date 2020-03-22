import asyncio
from unittest.mock import MagicMock

import pytest

from app import helpers, tables

from . import defaults
from . import helpers as test_helpers


class TestUpdateCheckin:
    # Error handling currently isn't supported by databases on the postgresql
    # side (see
    # https://github.com/encode/databases/pull/150#issuecomment-564532277) so
    # I'm going to leave this test empty for now
    @pytest.mark.asyncio
    async def test_updating_checkin_that_doesnt_exist(self, connected_db):
        pass

    @pytest.mark.asyncio
    async def test_updating_existing_checkin(self, connected_db):
        status = tables.CheckinStatus.FAILED
        log = "test"

        query = tables.checkins.insert().values(**defaults.TEST_CHECKIN)
        last_record_id = await connected_db.execute(query)

        assert status != defaults.TEST_CHECKIN.get("status")
        assert log != defaults.TEST_CHECKIN.get("log")

        await helpers.update_checkin(
            connected_db, last_record_id, status, log,
        )

        query = tables.checkins.select().where(tables.checkins.c.id == last_record_id)
        checkin = await connected_db.fetch_one(query)

        assert_json = {
            **defaults.TEST_CHECKIN,
            "status": status,
            "logs": log,
            "id": last_record_id,
        }

        assert {**checkin} == assert_json


class TestObserveContainer:
    @pytest.mark.asyncio
    async def test_container_is_updated_properly(self, connected_db, monkeypatch):
        test_cases = [
            ("Failed", defaults.FAILED_STATUS),
            ("Success!", defaults.FAILED_STATUS),
            ("Kevin Schoonover got B04!", defaults.SUCCESS_STATUS),
            ("Kevin Schoonover got B17!", defaults.SUCCESS_STATUS),
            (
                "Kevin Schoonover got B4!\nBevin Schoonover got A3!",
                defaults.SUCCESS_STATUS,
            ),
            ("Test Test Test\nKevin Schoonover got C17!", defaults.SUCCESS_STATUS),
        ]
        sleep_mock = test_helpers.AsyncMock()
        monkeypatch.setattr("asyncio.sleep", sleep_mock)

        for log, result_status in test_cases:
            query = tables.checkins.insert().values(**defaults.TEST_CHECKIN)
            last_record_id = await connected_db.execute(query)
            container = test_helpers.MockContainer(
                tables.CheckinStatus.WAITING, log, "test"
            )

            def update_container(*args, **kwargs):
                container.status = "exited"

            container.reload = MagicMock()
            container.reload.side_effect = update_container

            await helpers.observe_container(connected_db, last_record_id, container)

            query = tables.checkins.select().where(
                tables.checkins.c.id == last_record_id
            )
            checkin = await connected_db.fetch_one(query)

            assert_json = {
                **defaults.TEST_CHECKIN,
                "status": result_status,
                "logs": log,
                "id": last_record_id,
            }

            assert {**checkin} == assert_json
