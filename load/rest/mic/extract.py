import mic.data.oracle
import mic.data.queries

from mic.maps import names_map


class Extractor:

    def extract(self, **params):
        raise NotImplementedError


class OracleExtractor(Extractor):
    def __init__(self, configs):
        self.__connection__ = connection = mic.data.oracle.Connection(configs.get("source"))
        self.__cursor__ = connection.cursor()
        schema = configs['source'].get('schema', None)
        if schema:
            sql = "alter session set current_schema = " + schema + ""
            self.__cursor__.execute(sql)

    def extract(self, **params):
        super().extract()

    def get_meta(self):
        raise NotImplementedError


class CustImportExtractor(OracleExtractor):
    def __init__(self, configs):
        super().__init__(configs)
        self.__meta__ = None
        self.company = configs.get('params').get('company')
        self.plant = configs.get('params').get('plant')

    def extract(self, params):
        period = params.get('period')
        return mic.data.oracle.fetchall(self.__cursor__, mic.data.queries.get_basic_info_v2,
                                        (self.company, self.plant, period))

    def get_meta(self):
        if self.__meta__:
            return self.__meta__

        if not self.__cursor__.description:
            mic.data.oracle.fetchall(self.__cursor__, mic.data.queries.get_basic_info_v2,
                                     (self.company, self.plant, 0))

        self.__meta__ = {}
        for d in self.__cursor__.description:
            name = d[0].lower()
            _type = str(d[1].__name__)
            self.__meta__[name] = _type

        return self.__meta__
