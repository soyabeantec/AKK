FROM python:3.7-slim-buster

ENV http_proxy http://mic-web2.mic.co.at:3128

ENV http_proxys http://mic-web2.mic.co.at:3128

COPY requirements.txt /tmp

RUN pip install --trusted-host pypi.python.org -r /tmp/requirements.txt

WORKDIR /app

COPY producer.py /app/

CMD ["python", "producer.py"]
