from unittest.mock import MagicMock

from app import tables


class AsyncMock(MagicMock):
    async def __call__(self, *args, **kwargs):
        return super(AsyncMock, self).__call__(*args, **kwargs)


class MockContainer:
    def __init__(self, status: tables.CheckinStatus, log_message: str, id="test"):
        self.id = id
        self.status = status
        self.logs = lambda: log_message.encode("utf-8")
