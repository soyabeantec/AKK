import os
import json
import time
import socket
import logging
import datetime

from kafka import KafkaProducer


class Producer(object):
    def __init__(self, brokers):
        self.__producer = KafkaProducer(
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            bootstrap_servers=brokers)

    def send_page_data(self, topic, key, data):
        key_bytes = bytes(key, encoding='utf-8')
        result = self.__producer.send(
            topic,
            key=key_bytes,
            value=data
        ).add_errback(on_error).add_callback(on_success)


def on_error(err):
    logging.error('fail to send', exc_info=err)

def on_success(meta):
    logging.info('success %s', str(meta))

def to_epoch(dt):
    return int((dt - datetime.datetime(1970,1,1)).total_seconds())

def parse_log_line(line):
    strptime = datetime.datetime.strptime
    hostname = socket.gethostname()
    time = line.split(' ')[3][1::]
    entry = {}
    entry['timestamp'] = str(to_epoch(strptime(time, "%d/%b/%Y:%H:%M:%S")))
    entry['source'] = "{}".format(hostname)
    entry['type'] = "www_access"
    entry['log'] = "'{}'".format(line.rstrip())
    return entry


def show_entry(entry):
    temp = ",".join([
        entry['timestamp'],
        entry['source'],
        entry['type'],
        entry['log']
    ])
    log_entry = {'log': entry}
    temp = json.dumps(log_entry)
    logging.info("{}".format(temp))
    return temp


def main():
    kh = os.getenv('KH', 'localhost')
    kp = os.getenv('KP', '9092')
    ks = kh + ':' + str(kp)
    logging.info('Kafka server %s', ks)

    brokers = [ks]
    logging.info('KS: %s', str(brokers))
    logfile = open('/data/access.log')
    logfile.seek(0, 2)
    producer = Producer(brokers)
    while True:
        line = logfile.readline()
        if not line:
            time.sleep(0.1)
            continue
        else:
            entry = parse_log_line(line)
            if not entry:
                continue
            json_entry = show_entry(entry)
            producer.send_page_data('log', 'www_access', json_entry)


if __name__ == '__main__':
    logging.basicConfig(filename='/logs/producer.log',
        filemode='w',
        format='%(name)s - %(levelname)s - %(message)s',
        level=logging.INFO)
    main()
