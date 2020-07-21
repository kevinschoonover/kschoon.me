# /usr/bin/env python
"""Southwest Checkin.

From: https://github.com/pyro2927/SouthwestCheckin
"""
import logging
import os
from math import trunc
from datetime import datetime, timedelta, timezone
from threading import Thread
import sys
import time

from faktory import Worker, connection
from dotenv import load_dotenv

from southwest import Reservation, openflights, errors
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

transport = RequestsHTTPTransport(url="http://web:8080", verify=False, retries=3,)

gql_client = Client(transport=transport, fetch_schema_from_transport=True,)

query = gql(
    """
    mutation updateCheckinStatus($id: Int!, $status: CheckinStatusEnum!) {
      updateCheckinStatus(id: $id, status: $status) {
        id
        firstName
        lastName
        reservationCode
        checkinStatus
      }
    }
"""
)

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)
load_dotenv()

faktory_url = os.getenv("FAKTORY_URL", "tcp://password@localhost:7419")
CHECKIN_EARLY_SECONDS = 5


def start_checkin(
    checkin_id, checkin_time, reservation_number, first_name, last_name, verbose=False
):
    logger.info(
        "Attempting to check in {} {} @ {}. Confirmation: {}\n".format(
            first_name, last_name, checkin_time, reservation_number
        )
    )
    reservation, _ = lookup_reservation(reservation_number, first_name, last_name)
    checkin_time = datetime.fromtimestamp(checkin_time, tz=timezone.utc)
    current_time = datetime.utcnow().replace(tzinfo=timezone.utc)
    # check to see if we need to sleep until 24 hours before flight
    if checkin_time > current_time:
        # calculate duration to sleep
        delta = (checkin_time - current_time).total_seconds() - CHECKIN_EARLY_SECONDS
        # pretty print our wait time
        m, s = divmod(delta, 60)
        h, m = divmod(m, 60)
        logger.info(
            "Too early to check in.  Waiting {} hours, {} minutes, {} seconds".format(
                trunc(h), trunc(m), s
            )
        )
        try:
            time.sleep(delta)
        except OverflowError:
            print(
                "System unable to sleep for that long, try checking in closer to your departure date"
            )
            sys.exit(1)
    data = reservation.checkin()

    logger.info(data)
    for flight in data["flights"]:
        for doc in flight["passengers"]:
            checkin = "{} got {}{}!".format(
                doc["name"], doc["boardingGroup"], doc["boardingPosition"]
            )
    params = {"id": checkin_id, "status": "SUCCESS"}
    gql_client.execute(query, variable_values=params)


def lookup_reservation(reservation_number, first_name, last_name, verbose=False):
    r = Reservation(reservation_number, first_name, last_name, verbose)
    body = r.lookup_existing_reservation()

    # Get our local current time
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    tomorrow = now + timedelta(days=1)

    flight_times = []

    # find all eligible legs for checkin
    for leg in body["bounds"]:
        # calculate departure for this leg
        airport = "{}, {}".format(
            leg["departureAirport"]["name"], leg["departureAirport"]["state"]
        )
        takeoff = "{} {}".format(leg["departureDate"], leg["departureTime"])
        airport_tz = openflights.timezone_for_airport(leg["departureAirport"]["code"])
        date = airport_tz.localize(datetime.strptime(takeoff, "%Y-%m-%d %H:%M"))
        if date > now:
            # found a flight for checkin!
            print(
                "Flight information found, departing {} at {}".format(
                    airport, date.strftime("%b %d %I:%M%p")
                )
            )
            flight_times.append(date)

    return r, flight_times


def schedule_checkin(checkin_id, reservation_number, first_name, last_name):
    checkin_id = int(checkin_id)
    logger.info(
        "Scheduling check in for {} {}. Confirmation: {}\n".format(
            first_name, last_name, reservation_number
        )
    )
    with connection(faktory=faktory_url) as client:
        try:
            reservation, flight_times = lookup_reservation(
                reservation_number, first_name, last_name
            )

            for flight_time in flight_times:
                flight_time_utc = flight_time.astimezone(timezone.utc)
                checkin_time_utc = flight_time_utc - timedelta(days=1)

                # RFC3339 for faktory
                five_minutes_before_checkin = (
                    checkin_time_utc - timedelta(minutes=5)
                ).isoformat()

                success = client.queue(
                    "start_checkin",
                    at=five_minutes_before_checkin,
                    args=(
                        checkin_id,
                        checkin_time_utc.timestamp(),
                        reservation_number,
                        first_name,
                        last_name,
                    ),
                )

                params = {"id": checkin_id, "status": "SCHEDULED"}
                if not success:
                    params["status"] = "FAILED"
                gql_client.execute(query, variable_values=params)

        except errors.FailedCheckin:
            logger.error("Could not look up requested reservation")
            params = {"id": checkin_id, "status": "FAILED"}
            gql_client.execute(query, variable_values=params)

            return


w = Worker(faktory=faktory_url, queues=["default"], concurrency=16)
w.register("start_checkin", start_checkin)
w.register("schedule_checkin", schedule_checkin)


w.run()  # runs until control-c or worker shutdown from Faktory web UI
