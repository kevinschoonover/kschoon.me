from pydantic import BaseModel

from .tables import CheckinStatus


class CheckinCreate(BaseModel):
    first_name: str
    last_name: str
    reservation_code: str


class Checkin(BaseModel):
    id: int
    first_name: str
    last_name: str
    reservation_code: str
    status: CheckinStatus
