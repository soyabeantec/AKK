import datetime
import inspect
import json

from aiohttp.http_exceptions import HttpBadRequest
from aiohttp.web import Request, Response
from aiohttp.web_exceptions import HTTPMethodNotAllowed

from mic.data.models import client
from mic.utils import DateTimeEncoder, get_configs

__version__ = '0.1.0'

DEFAULT_METHODS = ('GET',)


# 'POST', 'PUT', 'DELETE')


class RestEndpoint:
    def __init__(self):
        self.methods = {}

        for method_name in DEFAULT_METHODS:
            method = getattr(self, method_name.lower(), None)
            if method:
                self.register_method(method_name, method)

    def register_method(self, method_name, method):
        self.methods[method_name.upper()] = method

    async def dispatch(self, request: Request):
        method = self.methods.get(request.method.upper())
        if not method:
            raise HTTPMethodNotAllowed('', DEFAULT_METHODS)

        wanted_args = list(inspect.signature(method).parameters.keys())
        available_args = request.match_info.copy()
        available_args.update({'request': request})
        unsatisfied_args = set(wanted_args) - set(available_args.keys())
        if unsatisfied_args:
            # Expected match info that doesn't exist
            raise HttpBadRequest('')

        return await method(**{arg_name: available_args[arg_name] for arg_name in wanted_args})


class DeclarationEndpoint(RestEndpoint):
    def __init__(self):
        super().__init__()

    async def get(self, params) -> Response:
        params = json.loads(params)
        period = params.get('period')
        declaration_id = params.get('declaration_id')
        if declaration_id:
            data = client.get_decl(period, declaration_id)
        else:
            if not period:
                dt = datetime.datetime.now()
                period = "{}{:d}".format(dt.year, dt.month)
                period = int(period)
            data = client.get_decls(period)
        body = json.dumps({'declarations': data}, indent=4, cls=DateTimeEncoder).encode('utf-8')
        return Response(status=200, body=body, content_type='application/json')


class UniqueIdEndpoint(RestEndpoint):
    def __init__(self):
        super().__init__()

    async def get(self, params) -> Response:
        params = json.loads(params)
        company = params.get('company')
        plant = params.get('plant')
        import_country = params.get('import_country')
        period = params.get('period')
        if period:
            data = client.get_period_uids(company, plant, import_country, period)
        else:
            data = client.get_uids(company, plant, import_country)
        body = json.dumps({'unique_ids': data}, indent=4, cls=DateTimeEncoder).encode('utf-8')
        return Response(status=200, body=body, content_type='application/json')


