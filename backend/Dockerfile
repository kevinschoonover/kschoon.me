FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

RUN rm /app/main.py

EXPOSE 80

COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY app/ /app/app/
