import asyncio
import re

import databases
import docker

from . import tables

SUCCESS_REGEX: str = r"(\w+ \w+) got (\w\d+)!"
success_match: re.Pattern = re.compile(SUCCESS_REGEX)


async def update_checkin(
    db: databases.Database, id: int, status: tables.CheckinStatus, logs: str
):
    query = (
        tables.checkins.update()
        .where(tables.checkins.c.id == id)
        .values(status=status.value, logs=logs)
    )

    return await db.execute(query)


async def observe_container(
    db: databases.Database, id: int, container: docker.models.containers.Container
):
    while container.status != "exited":
        container.reload()
        await asyncio.sleep(5)
    logs = container.logs().decode("utf-8")
    status = tables.CheckinStatus.FAILED
    matches = success_match.findall(logs)

    if len(matches) > 0:
        status = tables.CheckinStatus.COMPLETED

    await update_checkin(db, id, status, logs)
