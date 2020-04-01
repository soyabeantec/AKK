from mic.data.maps import declaration_map


class Transformer:
    """
    Transforms a given data object. THis is a
    template class
    """

    def transform(self, data):
        raise NotImplementedError


class JSONTransformer(Transformer):
    """
    Transforms data object (given as list of values)
    into JSON object (dict).
    """

    def __init__(self, meta_dict):
        self.meta_dict = meta_dict

    def transform(self, data_dict):
        result = {}
        for k, v in data_dict.items():
            raws = []
            self.trans_raws(raws, v)
            result[k] = raws

        return result

    def trans_raws(self, lst, raws):
        for raw in raws:
            obj = self.trans_raw(raw)
            lst.append(obj)

    def trans_raw(self, raw):
        obj = {}
        idx = 0
        for name in self.meta_dict.keys():
            name = declaration_map.get(name).get('name')

            obj[name] = raw[idx]
            idx += 1
        return obj
