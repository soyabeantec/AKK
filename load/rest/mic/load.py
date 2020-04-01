import logging
import json
import time

from redis import Redis
from cassandra.cluster import Cluster
from datetime import datetime
from mic.data.oracle import Connection


class Loader:
    """load data into store (template class)."""

    def load(self, key, data):
        raise NotImplementedError

    def shutdown(self):
        raise NotImplementedError


class OracleLoader(Loader):
    """Load data into Oracle Database."""

    def __init__(self, configs):
        logging.info("Create a connection to %s:%s",
                     configs.get('host'), configs.get('port'))
        self.connection = Connection(configs)
        self.cursor = self.connection.cursor()
        schema = configs.get('schema', None)
        if schema:
            sql = "alter session set current_schema = " + schema + ""
            self.cursor.execute(sql)

    def load(self, key, data):
        raise NotImplementedError

    def shutdown(self):
        self.connection.shutdown()

    def __del__(self):
        self.shutdown()


class CassandraLoader(Loader):
    """Load data into Cassandra store."""
    total_time = 0
    total_count = 0
    total_batch_count = 0
    total_batch_time = 0

    def __init__(self, cluster_list, keyspace, port=9042):
        logging.info("Create a cassandra cluster : %s, keyspace: %s",
                     str(cluster_list), keyspace)
        cluster = Cluster(cluster_list, port=port)
        self.session = cluster.connect(keyspace, wait_for_all_pools=True)
        self.session.execute('Use {} ;'.format(keyspace))

    def batch_load(self, key, data):
        st = time.time()
        batch_sql = "BEGIN BATCH\n"
        fields = "company, plant, import_country, period, declaration_id, load_timestamp, declaration"
        for d in data:
            sql = "INSERT INTO {} ({}) " \
                  "VALUES ('{}', '{}', '{}', {}, '{}', " \
                  "toTimeStamp(now()), '{}');\n".format(key, fields, d[0], d[1], d[2], d[3], d[4], d[5])
            batch_sql += sql
        batch_sql += "APPLY BATCH"
        self.session.execute(batch_sql)
        self.total_batch_time += (time.time() - st)
        self.total_batch_count += 1

    def load(self, key, data):
        st = time.time()
        fields = "company, plant, import_country, period, declaration_id, load_timestamp, declaration"
        sql = "INSERT INTO {} ({}) VALUES " \
              "('{}', '{}', '{}', {}, '{}', " \
              "toTimeStamp(now()), '{};')".format(key, fields, data[0], data[1], data[2], data[3], data[4], data[5])

        self.session.execute(sql)
        self.total_time += (time.time() - st)
        self.total_count += 1
        logging.debug('sent to cassandra.')

    def shutdown(self):
        self.session.shutdown()


class RedisLoader(Loader):
    """Load data into Redis store."""

    def __init__(self, hostname, port):
        logging.info('Create a Redis connection  to : %s:%s',
                     hostname, str(port))
        self.client = Redis(host=hostname, port=port)

    def load(self, key, data):
        logging.debug('insert log to redis')
        timestamp = datetime.now().timestamp()
        self.client.zadd(key, {json.dumps(data): timestamp})
        logging.debug('sent to redis.')

    def shutdown(self):
        self.client.shutdown()
