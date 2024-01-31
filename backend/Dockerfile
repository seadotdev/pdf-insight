# https://hub.docker.com/_/python
FROM python:3.11.3-slim-bullseye

ENV PYTHONUNBUFFERED True
ENV APP_HOME /app
WORKDIR $APP_HOME
RUN pip install poetry
COPY . ./
RUN apt-get update
RUN apt-get install libpq-dev gcc build-essential tesseract-ocr postgresql-client wkhtmltopdf -y
RUN poetry install

CMD ["poetry", "run", "start"]
