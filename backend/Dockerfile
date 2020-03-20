FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

EXPOSE 80

COPY app/ /app/
COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt
