import json

from aiohttp import web

from aiohttp_swagger3 import SwaggerDocs

from mic.data.client import CassandraClient
from mic.utils import DateTimeEncoder

client = CassandraClient(['172.17.0.1'], 'mic')

async def get_welcome_message(request: web.Request) -> web.Response:
    """
    ---
    summary: Welcome message.
    tags:
      - welcome
    responses:
      '200':
        description: Welcome message
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Message'
    """
    body = json.dumps({'message': "Welcome to MIC Data Analytics"}, indent=4).encode('utf-8')
    return web.Response(status=200, body=body, content_type='application/json')


async def get_uids(request: web.Request, params) -> web.Response:
    """
    ---
    summary: Get Unique IDs for Cust-Import Declarations.
    tags:
      - uid
    parameters:
      - name: params
        description: '{"company": "90", "plant": "01", "import_country": "DE"}'
        in: query
        required: true
        schema:
          type: string
    responses:
      '200':
        description: Get Unique IDs
        content:
          application/json:
            schema:
              type: array
              $ref: "#/components/schemas/UID"
      '400':
        $ref: "#/components/responses/BadRequest"
    """
    params = json.loads(params)
    company = params.get('company')
    plant = params.get('plant')
    import_country = params.get('import_country')
    period = params.get('period')

    if not (company and plant and import_country):
        body = json.dumps({"message": 'company, plant and import_country are required.'}).encode('utf-8')
        return web.Response(status=400, body=body, content_type='application/json')

    if period:
        data = client.get_period_uids(company, plant, import_country, period)
    else:
        data = client.get_uids(company, plant, import_country)
    body = json.dumps(data, indent=4, cls=DateTimeEncoder).encode('utf-8')
    return web.Response(status=200, body=body, content_type='application/json')


async def get_declarations(request: web.Request, params) -> web.Response:
    """
    ---
    summary: Get Declarations of Cust-Import.
    tags:
      - declaration
    parameters:
      - name: params
        description: '{"company": "90", "plant": "01", "import_country": "DE"}'
        in: query
        required: true
        schema:
          type: string
    responses:
      '200':
        description: Get Declarations
        content:
          application/json:
            schema:
              type: array
              $ref: "#/components/schemas/Declaration"
      '400':
        $ref: "#/components/responses/BadRequest"
    """
    params = json.loads(params)
    company = params.get('company')
    plant = params.get('plant')
    import_country = params.get('import_country')
    period = params.get('period')
    declaration_id = params.get('declaration_id')

    if not (company and plant and import_country):
        body = json.dumps({"message": 'company, plant and import_country are required.'}).encode('utf-8')
        return web.Response(status=400, body=body, content_type='application/json')

    if declaration_id:
        if not period:
            body = json.dumps({"message": 'period is required.'}).encode('utf-8')
            return web.Response(status=400, body=body, content_type='application/json')
        data = client.get_decl(company, plant, import_country, period, declaration_id)
    else:
        if not period:
            data = client.get_all_decls(company, plant, import_country)
        else:
            data = client.get_decls(company, plant, import_country, period)
    body = json.dumps(data, indent=4, cls=DateTimeEncoder).encode('utf-8')
    return web.Response(status=200, body=body, content_type='application/json')


def main():
    app = web.Application()
    s = SwaggerDocs(
        app,
        '/docs',
        title="MIC Data Analytics",
        version="1.0.0",
        components="configs/components.yml"
    )
    s.add_routes(
        [
            web.get("/", get_welcome_message),
            web.get("/u", get_uids),
            web.get("/d", get_declarations)
        ]
    )
    web.run_app(app, host='172.31.45.75', port=80)


if __name__ == '__main__':
    main()
