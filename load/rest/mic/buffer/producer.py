from multiprocessing.managers import BaseManager


class BufferManager(BaseManager):
    pass


BufferManager.register('create_topic')
BufferManager.register('get_from_topic')
BufferManager.register('put_to_topic')
BufferManager.register('get_topics')


class Producer:
    def send(self, topic, message):
        raise NotImplementedError


class SimpleProducer(Producer):
    def __init__(self):
        self.__manager__ = BufferManager(address=('localhost', 50000), authkey=b'test')
        self.__manager__.connect()

    def send(self, topic, message):
        self.__manager__.put_to_topic(topic, message)

    def __del__(self):
        pass
        # self.__manager__.shutdown()

