from pydantic import BaseModel

from .tables import CheckinStatus


class CheckinCreate(BaseModel):
    status: CheckinStatus
    first_name: str
    last_name: str
    reservation_code: str


class Checkin(BaseModel):
    id: int
    status: CheckinStatus
    first_name: str
    last_name: str
    reservation_code: str
