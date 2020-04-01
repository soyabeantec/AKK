import csv
import sys
import yaml
import re
import math
import pandas as pd
import time

from logging import DEBUG
from json import JSONDecoder
from json import JSONEncoder
from datetime import datetime
from logging.handlers import RotatingFileHandler


def dt2ts(dt):
    """Converts a datetime object to UTC (epoch) timestamp"""
    return int((dt - datetime(1970, 1, 1)).total_seconds() * 1000)


def utc_now():
    """return now as UTC (epoch) timestamp"""
    return dt2ts(datetime.now())


def dict_to_object(d):
    if '__type__' not in d:
        return d

    typ = d.pop('__type__')
    try:
        date_obj = datetime(**d)
        return date_obj
    except Exception:
        d['__type__'] = typ
        return d


class DateTimeDecoder(JSONDecoder):

    def __init__(self, *args, **kargs):
        JSONDecoder.__init__(self, object_hook=dict_to_object,
                             *args, **kargs)


class DateTimeEncoder(JSONEncoder):
    """ Instead of letting the default encoder convert datetime to string,
        convert datetime objects into a dict, which can be decoded by the
        DateTimeDecoder
    """

    def default(self, obj):
        if isinstance(obj, datetime):
            return {
                '__type__': 'datetime',
                'year': obj.year,
                'month': obj.month,
                'day': obj.day,
                'hour': obj.hour,
                'minute': obj.minute,
                'second': obj.second,
                'microsecond': obj.microsecond,
            }
        else:
            return JSONEncoder.default(self, obj)


class DebugFileHandler(RotatingFileHandler):
    def __init__(self, filename, mode='a', maxBytes=0, backupCount=0, encoding=None, delay=False):
        RotatingFileHandler.__init__(
            self, filename, mode, maxBytes, backupCount, encoding, delay)

    def emit(self, record):
        if not record.levelno == DEBUG:
            return
        RotatingFileHandler.emit(self, record)


def camel_case_split(sstr):
    return re.findall(r'[A-Z](?:[a-z]+|[A-Z]*(?=[A-Z]|$))', sstr)


def get_configs(fn):
    """
    Read Yaml configurations.
    :param fn: file name.
    :return: a dict object contains all configurations found in
    the given file.
    """
    config_file_name = fn
    with open(config_file_name, 'r') as config_file:
        configs = yaml.load(config_file, Loader=yaml.BaseLoader)
    return configs


def load_csv(path, h=None):
    data = []
    with open(path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        for row in reader:
            if row:
                data.append(row)
    if h is None:
        return data, None
    else:
        return data[h + 1:], data[h]


X = 1
T = 1
Y = 0
C = 0
START_TIME = 0
COUNTER = 0


def setup_tool_bar(title, L):
    title += '|'
    # setup toolbar
    # sys.stdout.write("[%s]" % (" " * toolbar_width))
    toolbar_width = 100
    global X
    global Y
    global T
    global C
    global START_TIME
    global COUNTER

    COUNTER = 0
    C = 0
    Y = 0
    X = toolbar_width / L
    if X > 1:
        T = int(math.trunc(X))
    else:
        T = int(math.ceil(X))

    sys.stdout.write(" %s %s>" % (title, (" " * toolbar_width)))
    sys.stdout.flush()
    # return to start of line, after '['
    sys.stdout.write("\b" * (toolbar_width + 1))
    START_TIME = time.time()


def update_tool_bar():
    # update the bar
    global X
    global Y
    global C
    global COUNTER

    if X < 1:
        Y = Y + X
    else:
        Y = T

    if Y >= T:
        sys.stdout.write("\b")
        sys.stdout.write("%s" % ("-" * T))
        sys.stdout.write("%s" % ">")
        sys.stdout.flush()
        Y = 0
        C = C + T
    COUNTER += 1


def end_tool_bar():
    global START_TIME
    global COUNTER

    t = time.time() - START_TIME
    sys.stdout.write("\b")
    if C < 100:
        sys.stdout.write("%s" % ("-" * (100 - C)))
        sys.stdout.flush()
    sys.stdout.write("| Time = %.2f seconds, Iterations = %i \n" % (t, COUNTER))


def meta_csv2json(fn, sht):
    df = pd.read_excel(fn, sht)
    return df


def get_last_digits(num, last_digits_count=2):
    return abs(num) % (10 ** last_digits_count)
