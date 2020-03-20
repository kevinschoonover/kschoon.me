from typing import List

from fastapi import FastAPI

from . import schema, tables
from .database import database, engine

tables.metadata.create_all(engine)


app = FastAPI(
    title="Auto Check-in",
    description=(
        "Airline Check-in as a Service for all those times you've had to"
        "wake up before 8 am to get boarding group A for Southwest."
    ),
    version="0.1.0",
    redoc_url="/",
)


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.get("/checkins/", response_model=List[schema.Checkin])
async def all_checkins():
    query = tables.checkins.select()
    return await database.fetch_all(query)


# @app.post("/checkins/", response_model=schema.CheckinCreate)
# async def create_checkins(note: NoteIn):
#     query = notes.insert().values(text=note.text, completed=note.completed)
#     last_record_id = await database.execute(query)
#     return {**note.dict(), "id": last_record_id}
