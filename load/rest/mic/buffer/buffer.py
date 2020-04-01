from multiprocessing.managers import BaseManager
from queue import Queue


class Buffer:
    def __init__(self):
        self.__topics__ = {}

    def create_topic(self, topic):
        self.__topics__[topic] = Queue()

    def get_from_topic(self, topic):
        if self.__topics__.get(topic):
            if not self.__topics__.get(topic).empty():
                return self.__topics__.get(topic).get()

    def put_to_topic(self, topic, msg):
        # print("We've got {} for {}".format(msg, topic))
        if not self.__topics__.get(topic):
            self.create_topic(topic)
        self.__topics__.get(topic).put(msg)

    def get_topics(self):
        return self.__topics__.keys()


class BufferManager(BaseManager):
    pass


buffer = Buffer()


def create_topic(topic):
    buffer.create_topic(topic)


def get_from_topic(topic):
    msg = buffer.get_from_topic(topic)
    return msg


def put_to_topic(topic, msg):
    buffer.put_to_topic(topic, msg)


def get_topics():
    return buffer.get_topics()

