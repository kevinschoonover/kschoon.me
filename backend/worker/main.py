# /usr/bin/env python
"""Southwest Checkin.

From: https://github.com/pyro2927/SouthwestCheckin
"""
import logging
import os
from math import trunc
from datetime import datetime, timedelta
from threading import Thread
import sys
import time

from faktory import Worker
from pytz import utc
from dotenv import load_dotenv

from southwest import Reservation, openflights, errors
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

transport = RequestsHTTPTransport(url="http://web:8080", verify=False, retries=3,)

client = Client(transport=transport, fetch_schema_from_transport=True,)

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


def schedule_checkin(flight_time, reservation):
    checkin_time = flight_time - timedelta(days=1)
    current_time = datetime.utcnow().replace(tzinfo=utc)
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


def auto_checkin(checkin_id, reservation_number, first_name, last_name, verbose=False):
    r = Reservation(reservation_number, first_name, last_name, verbose)
    try:
        body = r.lookup_existing_reservation()
    except errors.FailedCheckin:
        logger.error("Could not look up requested reservation")
        params = {"id": checkin_id, "status": "FAILED"}
        client.execute(query, variable_values=params)

        return

    # Get our local current time
    now = datetime.utcnow().replace(tzinfo=utc)
    tomorrow = now + timedelta(days=1)

    threads = []

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
            # Checkin with a thread
            t = Thread(target=schedule_checkin, args=(date, r))
            t.daemon = True
            t.start()
            threads.append(t)
    params = {"id": checkin_id, "status": "COMPLETED"}
    client.execute(query, variable_values=params)

    # cleanup threads while handling Ctrl+C
    while True:
        if len(threads) == 0:
            break
        for t in threads:
            t.join(5)
            if not t.isAlive():
                threads.remove(t)
                break


def start_checkin(checkin_id, reservation_number, first_name, last_name):
    logger.info(
        "Attempting to check in {} {}. Confirmation: {}\n".format(
            first_name, last_name, reservation_number
        )
    )
    auto_checkin(int(checkin_id), reservation_number, first_name, last_name)

    return


w = Worker(faktory=faktory_url, queues=["default"], concurrency=8)
w.register("start_checkin", start_checkin)

w.run()  # runs until control-c or worker shutdown from Faktory web UI
