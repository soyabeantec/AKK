import json
from mic.utils import DateTimeDecoder, DateTimeEncoder


class Base:
    __fields__ = []

    @classmethod
    def from_json(cls, data):
        return cls(**data)

    def to_json(self):
        d = {}
        for attr_name in self.__fields__:
            d[attr_name] = getattr(self, attr_name)
        return d

    def get(self, f):
        return str(getattr(self, f))


class UniqueId(Base):

    def __init__(self, company, plant, import_country, period, declaration_id, load_timestamp):
        super().__init__()
        self.company = company
        self.plant = plant
        self.period = period
        self.import_country = import_country
        self.declaration_id = declaration_id
        self.load_timestamp = load_timestamp
        self.__fields__ = ['company', 'plant', 'import_country', 'period', 'declaration_id', 'load_timestamp']

    def to_unique_id(self):
        return "-".join(map(self.get, self.__fields__))

    @staticmethod
    def from_unique_id_str(uid):
        fields = uid.split('-')
        return UniqueId(fields[0], fields[1], fields[2], fields[3], fields[4], fields[5])

    def __str__(self):
        txt = "company:{}, plant: {}, import_country {}, period: {}, declaration_id: {}, load_timestamp {} "
        return txt.format(str(self.company), str(self.plant), str(self.import_country),
                          str(self.period), str(self.declaration_id), str(self.load_timestamp))


class Declaration(Base):

    def __init__(self, company, plant, import_country, period, declaration_id, load_timestamp, data):

        self.__fields = ['company', 'plant', 'import_country', 'period', 'declaration_id', 'load_timestamp', 'data']
        self.company = company
        self.plant = plant
        self.import_country = import_country
        self.period = period
        self.declaration_id = declaration_id
        self.load_timestamp = load_timestamp
        self.data = data

    def to_json(self):
        d = {'company': self.company, 'plant': self.plant, 'import_country': self.import_country, 'period': self.period,
             'declaration_id': self.declaration_id, 'load_timestamp': self.load_timestamp,
             'data': json.loads(self.data, cls=DateTimeDecoder)}
        return d

    def __str__(self):
        return json.dumps(
            json.loads(self.to_json(), cls=DateTimeDecoder), cls=DateTimeEncoder, sort_keys=True, indent=2
        )
