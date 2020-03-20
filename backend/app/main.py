import os
import logging
from typing import List

import docker
from fastapi import FastAPI, HTTPException

from . import schema, tables
from .database import database, engine

client = docker.from_env()
logger = logging.getLogger(__name__)

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


@app.get("/checkins/{checkin_id}", response_model=schema.Checkin)
async def single_checkin(checkin_id: int):
    query = tables.checkins.select().where(tables.checkins.c.id == checkin_id)
    return await database.fetch_one(query)


@app.post("/checkins/", response_model=schema.Checkin)
async def create_checkins(checkin: schema.CheckinCreate):
    container = client.containers.run("hello-world", detach=True)
    query = tables.checkins.insert().values(
        reservation_code=checkin.reservation_code,
        first_name=checkin.first_name,
        last_name=checkin.last_name,
        status=DEFAULT_STATUS,
        container_id=container.id,
    )
    last_record_id = await database.execute(query)
    return {**checkin.dict(), "status": DEFAULT_STATUS, "id": last_record_id}