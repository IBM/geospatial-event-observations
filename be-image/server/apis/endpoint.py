#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
import glob
import io
import os
from PIL import Image
import shutil
from sqlalchemy import text
from sqlalchemy.sql import select
import sys
import time
import traceback
from werkzeug.utils import secure_filename

sys.path.append('..')

from config import baseDir, get_diagnostics
from .utils import allowed_file, allowed_image_file, print_trace
from event_database import engine, datasources

api = Namespace('endpoint', description='Endpoint for external datasources to post data.')

@api.route('/endpoint/<string:datasourceId>', endpoint='endpoint', methods=['POST'])
class Endpoint(Resource):
    @api.doc(description="Endpoint for external datasources to post data.")
    def post(self, datasourceId):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Endpoint API POST'

        try:
            if datasourceId != None and datasourceId != '':
                print(datasourceId)
                conn = engine.connect()
                sql = text('SELECT id,name,type,json_definition FROM datasources WHERE uuid="' + datasourceId + '";')
                datasourceResult = conn.execute(sql).fetchone()
                if datasourceResult['type'] == 'Webhook' and datasourceResult['json_definition'] != '':
                    print('Datasource: '+datasourceResult['name']+', Webhook Definition: '+datasourceResult['json_definition'])
                elif datasourceResult['type'] == 'Database' and datasourceResult['json_definition'] != '':
                    print('Datasource: '+datasourceResult['name']+', DB Info: '+datasourceResult['json_definition'])
                
                conn.close()

            if get_diagnostics():
                print_trace(func_desc, start)

            return None, 200
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return None, 200