import os
import ast
import json
import logging
import configparser
from cassandra.cluster import Cluster
from kafka import KafkaConsumer
from datetime import datetime

class Client:
    def __init__(self):
        raise NotImplementedError

    def update(self, data):
        raise NotImplementedError


class CassandraClient(Client):
    """CassandraDest."""

    def __init__(self, cluster_list, keyspace):
        logging.info('create a cassandra cluster : %s, keyspace: %s',
        str(cluster_list), keyspace)
        cluster = Cluster(cluster_list)
        self.session = cluster.connect()
        self.session.execute("CREATE KEYSPACE IF NOT EXISTS {} WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 3 };".format(keyspace))
        self.session = cluster.connect(keyspace)

    def update(self, data):
        logging.debug('insert log to cassandra')
        ts = str(int(float(data['timestamp'])))
        self.session.execute(
        """INSERT INTO logs (id, source, type, timestamp, log)
        VALUES (now(), %s, %s, %s, %s)""",
        (data['source'], data['type'], ts, data['log']))

        logging.debug('sent to cassandra.')


#class RedisClient(Client):
#    """docstring for RedisDest."""
#
#    def __init__(self, hostname, port):
#        logging.info('create a Redis connection  to : %s:%s',
 #           hostname, str(port))
 #       self.client = Redis(host=hostname, port=port)
#
 #   def update(self, data):
  #      logging.debug('insert log to redis')
   #     id = timestamp = datetime.now().timestamp()
    #    self.client.zadd('logs', {json.dumps(data): id})


if __name__ == '__main__':

    kh = os.getenv('KH', '172.31.33.222')
    kp = os.getenv('KP', '9092')
    ks = kh + ':' + str(kp)
    logging.info('Kafka server %s', ks)

    #rh = os.getenv('RH', 'localhost')
    #rp = os.getenv('RP', '6379')
    #logging.info('Redis server: %s:%s', rh, rp)
    #rc = RedisClient(rh, int(rp))

    cluster_list = ['172.17.0.1']
    keyspace = 'mic'
    logging.info('Cassandra cluster %s', str(cluster_list))
    logging.info('Cassandra keyspace %s', keyspace)
    cc = CassandraClient(cluster_list, keyspace)

    
    consumer = KafkaConsumer('log', bootstrap_servers=ks,
                value_deserializer=lambda m: json.loads(m.decode('utf8')))

    for message in consumer:
        logging.debug('got a log from kafka.')
        entry = json.loads(message.value)['log']
        cc.update(entry)
        #rc.update(entry)
