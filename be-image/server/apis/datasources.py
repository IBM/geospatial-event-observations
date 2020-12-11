#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
import glob
import json
import os
import shutil
from sqlalchemy import text
from sqlalchemy.sql import select
import subprocess
import sys
import time
import traceback
import uuid
from werkzeug.utils import secure_filename
import zipfile

sys.path.append('..')

from config import baseDir, get_diagnostics
from .utils import allowed_file, print_trace
from event_database import engine, datasources

api = Namespace('datasources', description='Datasource management functions.')

DatasourceTemplate = api.model('Datasource', {
    'id': fields.String(required=True, description='A unique id that refers to the Datasource', example=1),
    'name': fields.String(required=True, description='A unique name that refers to the Datasource', example='Social Media Feed'),
    'uuid': fields.String(required=True, description='A unique id that refers to the Datasource', example='00000-00000-00000-00000'),
    'type': fields.String(required=True, description='The Datasource type', example='File, Database, Webhook')
})

@api.route('/datasources', methods=['GET','POST','PUT','DELETE'])
class Datasources(Resource):
    @api.doc(description="Retrieve specified datasources.")
    def get(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Datsources API GET'

        try:
            conn = engine.connect()
            datasourcesSelect = select([datasources])
            datasourceResult = conn.execute(datasourcesSelect)
            datasourcesArray = []
            for row in datasourceResult:
                datasource = json.loads(row['json_definition'])
                datasource.update(id=row['id'])
                datasource.update(name=row['name'])
                datasource.update(uuid=row['uuid'])
                datasource.update(type=row['type'])
                datasourcesArray.append(datasource)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': 'GetDatasource', 'error_message': '', 'result': datasourcesArray})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': None, 'error_message': 'There was a problem retrieving datasource information.', 'result': 'Failure'})

    @api.expect(DatasourceTemplate)
    @api.doc(description="Update a datasource.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Datsources API POST'

        try:
            dsId = request.json['id']
            name = request.json['name']
            dsUUID = request.json['uuid']
            dsType = request.json['type']
            
            applyModel = False
            try:
                action = request.json['action']
                print('Applying model...')
                applyModel = True
            except:
                pass
            
            if applyModel:
                exeID = str(uuid.uuid4())
                exePath = os.path.dirname(os.path.abspath(__file__))
                exePath = exePath[:len(exePath)-5]
                exePath = os.path.join(exePath, 'execution', 'execution.py')

                trainingDataPath = request.json['model']['trainingDataPath']
                inputDataPath = os.path.join(baseDir, dsUUID)

                print('Datasource %s will be scored in execution: %s' % (name, exeID), flush=True)

                p = subprocess.Popen(
                    "python %s %s %s %s %s \"%s\" %s > %s/%s.log 2>&1" % (exePath, exeID, '-', inputDataPath, trainingDataPath, '-', json.dumps({}), baseDir, exeID),
                    shell=True
                )
            else:
                definition = {}
                if dsType == 'File':
                    try:
                        dsPath = request.json['path']
                        if dsUUID == '':
                            dsUUID = dsPath.split('/')[1]
                        definition.update(path=dsPath)
                    except:
                        traceback.print_exc()
                        dsUUID = str(uuid.uuid4())
                        definition.update(path=os.path.join(baseDir, dsUUID))
                        pass
                elif dsType == 'Database':
                    if dsUUID == '':
                        dsUUID = str(uuid.uuid4())
                    definition.update(dbType=request.json['dbType'])
                    definition.update(host=request.json['host'])
                    definition.update(db=request.json['db'])
                    definition.update(username=request.json['username'])
                    definition.update(password=request.json['password'])
                    definition.update(table=request.json['table'])
                elif dsType == 'Webhook':
                    if dsUUID == '':
                        dsUUID = str(uuid.uuid4())
                    definition.update(host=request.json['host'])
                    definition.update(steps=request.json['steps'])
            
                conn = engine.connect()
                datasourcesUpdate = datasources.update().values(
                                        name=name, 
                                        uuid=dsUUID,
                                        type=dsType,
                                        json_definition=json.dumps(definition)
                                    ).\
                                    where(datasources.c.id == dsId)
                conn.execute(datasourcesUpdate)
                conn.close()

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': None, 'error_message': 'There was a problem updating the specified datasource.', 'result': 'Failure'})

    @api.expect(DatasourceTemplate)
    @api.doc(description="Create a datasource.")
    def put(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Datsources API PUT'

        try:
            name = request.json['name']
            dsType = request.json['type']
            definition = {}
            dsUUID = ''
            if dsType == 'File':
                try:
                    dsPath = request.json['path']
                    pathElements = dsPath.split('/')
                    dsUUID = pathElements[len(pathElements)-1]
                    definition.update(path=dsPath)
                except:
                    traceback.print_exc()
                    dsUUID = str(uuid.uuid4())
                    definition.update(path=os.path.join(baseDir, dsUUID))
                    pass
            elif dsType == 'Database':
                dsUUID = str(uuid.uuid4())
                definition.update(dbType=request.json['dbType'])
                definition.update(host=request.json['host'])
                definition.update(db=request.json['db'])
                definition.update(username=request.json['username'])
                definition.update(password=request.json['password'])
                definition.update(table=request.json['table'])
            elif dsType == 'Webhook':
                dsUUID = str(uuid.uuid4())
                definition.update(host=request.json['host'])
                definition.update(steps=request.json['steps'])

            conn = engine.connect()
            datasourceInsert = datasources.insert().values(name=name,
                    uuid=dsUUID,
                    type=dsType,
                    json_definition=json.dumps(definition))
            conn.execute(datasourceInsert)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': None, 'error_message': 'There was a problem creating the specified datasource.', 'result': 'Failure'})

    @api.expect(DatasourceTemplate)
    @api.doc(description="Delete a datasource.")
    def delete(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Datsources API DELETE'

        try:
            dsId = request.json['id']
            name = request.json['name']
            uuid = request.json['uuid']
            dsType = request.json['type']

            conn = engine.connect()

            # delete any filesystem artifacts if type is File
            if dsType == 'File':
                #datasourcesSelect = datasources.query(datasources.c.json_definition).where(datasources.c.id == dsId)
                sql = text('SELECT json_definition FROM datasources WHERE id=' + str(dsId) + ';')
                #datasourceResult = conn.execute(datasourcesSelect)
                datasourceResult = engine.execute(sql)
                for row in datasourceResult:
                    json_definition = json.loads(row['json_definition'])
                    if os.path.exists(json_definition['path']):
                        shutil.rmtree(json_definition['path'])

            conn.execute(datasources.delete().where(datasources.c.id == dsId))
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'datasource': None, 'error_message': 'There was a problem deleting the specified model.', 'result': 'Failure'})
 