import cx_Oracle
from logging import getLogger
from mic.utils import DateTimeEncoder


class OracleEncoder(DateTimeEncoder):
    def default(self, obj):
        if isinstance(obj, cx_Oracle.Object):
            return object_repr(obj)
        else:
            return DateTimeEncoder.default(self, obj)


class Connection(cx_Oracle.Connection):
    """
    Wrapper for cx_Oracle Connection.
    """

    def __init__(self, configs):
        """
        Instantiate OracleConnection.
        :param configs: DB Link configurations.
        """

        user = configs['user']
        password = configs['password']
        host = configs['host']
        service_name = configs['service']
        port = configs['port']
        schema = configs['schema']
        # alter session set current_schema = <schema name>

        connection_string = "%s:%s/%s" % (host, port, service_name)
        connection_string = "%s/%s@%s" % (user, password, connection_string)

        self.logger = getLogger(__name__)
        super(Connection, self).__init__(connection_string)


def get_columns(table_name, cursor):
    if table_name:
        sql = "SELECT * from " + table_name.upper()
        cursor.execute(sql)
        columns = []
        for i in cursor.description:
            columns.append(i[0].lower())
        return columns


def get_column_idx(table_name, column_name, cursor):
    if column_name and table_name:
        sql = "SELECT * from " + table_name.upper()
        cursor.execute(sql)
        idx = 0
        for column in cursor.description:
            if column_name.upper() == column[0]:
                return idx
            idx = idx + 1
    else:
        raise TypeError('Invalid arguments')


def fetchall(cursor, query, param):
    """fetch all data after execute.
    :rtype list of records.
    """
    cursor.execute(query, param)
    return cursor.fetchall()


def object_repr(obj):
    if obj.type.iscollection:
        return_value = []
        for value in obj.aslist():
            if isinstance(value, cx_Oracle.Object):
                value = object_repr(value)
            return_value.append(value)
    else:
        return_value = {}
        for attr in obj.type.attributes:
            value = getattr(obj, attr.name)
            if value is None:
                continue
            elif isinstance(value, cx_Oracle.Object):
                value = object_repr(value)
            return_value[attr.name] = value

    return return_value
