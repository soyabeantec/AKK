FROM python:3.7-slim-buster

COPY ./consumer/requirements.txt /tmp

RUN pip install --trusted-host pypi.python.org -r /tmp/requirements.txt

WORKDIR /app

COPY ./consumer/consumer.py /app/

CMD ["python", "consumer.py"]
