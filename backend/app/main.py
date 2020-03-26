import asyncio
import os
import re
from typing import List

import docker
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import helpers, schema, tables
from .database import database, engine
from .logger import logger

client: docker.client.DockerClient = docker.from_env()

tables.metadata.create_all(engine)

DEFAULT_STATUS: tables.CheckinStatus = tables.CheckinStatus.WAITING


origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8080",
    "https://api.kschoon.me",
    "https://checkin.kschoon.me",
]


app: FastAPI = FastAPI(
    title="Auto Check-in",
    description=(
        "Airline Check-in as a Service for all those times you've had to"
        "wake up before 8 am to get boarding group A for Southwest."
    ),
    version="0.1.0",
    redoc_url="/",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.post("/checkins/", response_model=schema.Checkin)
async def create_checkins(
    checkin: schema.CheckinCreate, background_tasks: BackgroundTasks
):
    container = client.containers.run(
        "pyro2927/southwestcheckin:latest",
        [checkin.reservation_code, checkin.first_name, checkin.last_name],
        detach=True,
    )
    query = tables.checkins.insert().values(
        reservation_code=checkin.reservation_code,
        first_name=checkin.first_name,
        last_name=checkin.last_name,
        status=DEFAULT_STATUS,
        container_id=container.id,
    )
    last_record_id = await database.execute(query)
    background_tasks.add_task(
        helpers.observe_container, database, last_record_id, container
    )
    return {**checkin.dict(), "status": DEFAULT_STATUS, "id": last_record_id}


@app.get("/checkins/{checkin_id}", response_model=schema.Checkin)
async def single_checkin(checkin_id: int):
    query = tables.checkins.select().where(tables.checkins.c.id == checkin_id)
    checkin = await database.fetch_one(query)

    if checkin is None:
        raise HTTPException(status_code=404, detail="Check-in not found")

    return checkin
