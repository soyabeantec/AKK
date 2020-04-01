import time
import threading

from multiprocessing.managers import BaseManager
from threading import Thread


class BufferManager(BaseManager):
    pass


BufferManager.register('create_topic')
BufferManager.register('get_from_topic')
BufferManager.register('put_to_topic')
BufferManager.register('get_topics')


class Consumer:
    def register(self, topic, callback):
        raise NotImplementedError

    def unregister(self, topic, callback):
        raise NotImplementedError


class SimpleConsumer(Consumer):
    def __init__(self):
        self.__manager__ = BufferManager(address=('localhost', 50000), authkey=b'test')
        self.callbacks = {}
        self.__workers__ = {}
        self.__manager__.connect()
        self.__stopped__ = False

    def register(self, topic, callback):
        if not self.__stopped__:
            topics = self.__manager__.get_topics()._getvalue()
            if not (topic in topics):
                self.__manager__.create_topic(topic)
                self.callbacks[topic] = []
            if not self.callbacks.get(topic):
                self.callbacks[topic] = []

            self.callbacks.get(topic).append(callback)

            if not self.__workers__.get(topic):
                w = Worker(topic, self)
                self.__workers__[topic] = w
                w.start()

    def unregister(self, topic, callback, wait=False):
        if self.callbacks.get(topic):
            self.callbacks.get(topic).remove(callback)
        if not self.callbacks.get(topic):
            self.__workers__.get(topic).stop(wait)
            self.__workers__[topic] = None

    def stop(self, wait=False):
        self.__stopped__ = True
        self.__stop_workers__(wait=wait)

    def __stop_workers__(self, wait):
        for w in self.__workers__.values():
            if w:
                w.stop(wait)


class Worker(threading.Thread):
    def __init__(self, topic, stream):
        super(Worker, self).__init__()
        self.topic = topic
        self.stream = stream
        self._stop_event = threading.Event()
        self.__threads = []

    def stop(self, wait):
        if wait:
            while self.__check_threads():
                time.sleep(0.1)
        self._stop_event.set()

    def __check_threads(self):
        for t in self.__threads:
            if t.is_alive():
                return True
        return False

    def stopped(self):
        return self._stop_event.is_set()

    def run(self):
        manager = BufferManager(address=('localhost', 50000), authkey=b'test')
        manager.connect()
        topic = self.topic
        stream = self.stream

        while not self._stop_event.is_set():
            msg = manager.get_from_topic(topic)
            msg = msg._getvalue()
            if not msg:
                time.sleep(0.1)
            else:
                for callback in stream.callbacks.get(topic, []):
                    t: Thread = threading.Thread(target=callback, args=(topic, msg))
                    t.daemon = True
                    t.start()
                    self.__threads.append(t)

    def __del__(self):
        if self._stop_event.is_set():
            self._stop_event.set()
