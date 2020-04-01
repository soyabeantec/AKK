from cassandra.cluster import Cluster
from mic.data.models import Declaration, UniqueId


class CassandraClient:

    def __init__(self, cluster_list, keyspace, port=9042):
        cluster = Cluster(cluster_list, port=port)
        self.session = cluster.connect(keyspace, wait_for_all_pools=True)
        self.session.execute('Use {} ;'.format(keyspace))

    def get_all_decls(self, company, plant, import_country):
        sql = "select * from cust_import where company='{}' and plant='{}' " \
              "and import_country='{}' ALLOW FILTERING;".format(company, plant, import_country)
        rows = self.session.execute(sql)
        result = []
        for row in rows:
            d = Declaration(row.company, row.plant, row.import_country, row.period, row.declaration_id,
                            row.load_timestamp, row.declaration)
            result.append(d.to_json())

        return result

    def get_decls(self, company, plant, import_country, period):
        sql = "select * from cust_import where company='{}' and plant='{}' and import_country='{}' and period = {} " \
              "ALLOW FILTERING;".format(company, plant, import_country, period)
        rows = self.session.execute(sql)
        result = []
        for row in rows:
            d = Declaration(row.company, row.plant, row.import_country, row.period, row.declaration_id,
                            row.load_timestamp, row.declaration)
            result.append(d.to_json())

        return result

    def get_decl(self, company, plant, import_country, period, declaration_id):
        sql = "select * from cust_import where company='{}' and plant='{}' and import_country='{}' " \
              "and period = {} and declaration_id = '{}' " \
              "ALLOW FILTERING;".format(company, plant, import_country, period, declaration_id)
        result_set = self.session.execute(sql)
        result = []
        for row in result_set:
            d = Declaration(row.company, row.plant, row.import_country, row.period, row.declaration_id,
                            row.load_timestamp, row.declaration)
            result.append(d.to_json())
        return result

    def get_uids(self, company, plant, import_country):
        sql = "select company, plant, import_country, period, declaration_id, load_timestamp" \
              " from cust_import where company = '{}' and plant = '{}' and import_country = '{}';" \
            .format(company, plant, import_country)
        rows = self.session.execute(sql)
        result = []
        for row in rows:
            o = UniqueId(row.company, row.plant, row.import_country, row.period, row.declaration_id, row.load_timestamp)
            result.append(o.to_json())

        return result

    def get_period_uids(self, company, plant, import_country, period):
        sql = "select company, plant, import_country, period, declaration_id, load_timestamp" \
              " from cust_import where company = '{}' and plant = '{}' and import_country='{}' and period = {}" \
              " ALLOW FILTERING;" \
            .format(company, plant, import_country, period)

        rows = self.session.execute(sql)
        result = []
        for row in rows:
            o = UniqueId(row.company, row.plant, row.import_country, row.period, row.declaration_id,
                         row.load_timestamp)
            result.append(o.to_json())

        return result


