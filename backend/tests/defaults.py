from app import tables

DEFAULT_RESERVATION_CODE = "AAAAAA"
DEFAULT_FIRST_NAME = "Kevin"
DEFAULT_LAST_NAME = "Schoonover"

DEFAULT_STATUS = tables.CheckinStatus.WAITING
FAILED_STATUS = tables.CheckinStatus.FAILED
SUCCESS_STATUS = tables.CheckinStatus.COMPLETED

DEFAULT_STATUS = tables.CheckinStatus.WAITING
DEFAULT_LOG = "testing"

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
