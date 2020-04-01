FROM python:3.7-slim-buster

COPY ./rest/requirements.txt /tmp

RUN pip install --trusted-host pypi.python.org -r /tmp/requirements.txt

WORKDIR /app

COPY ./rest/rest_server.py /app/

COPY ./rest/mic /app/mic
COPY ./rest/configs /app/configs

EXPOSE 5002

CMD ["python", "rest_server.py"]