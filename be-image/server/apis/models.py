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
from event_database import engine, models

api = Namespace('models', description='Event Model management functions.')

ModelTemplate = api.model('Model', {
    'id': fields.String(required=True, description='A unique id that refers to the Model', example='1'),
    'name': fields.String(required=True, description='A unique name that refers to the Event the Event Model will detect', example='Fire'),
    'trainingDataPath': fields.String(required=True, description='The path to the training data for this Event Model.', example='$AEDC_HOME/models/$MODEL_ID'),
    'severity': fields.Integer(required=True, description='An indication of the seriousness of the event. Highest(0), High(1), Medium(2), Low(3), Lowest(4).', example=0),
    'icon': fields.Integer(required=True, description='The id of an entry in the icons table.', example=1)
})

@api.route('/models', methods=['GET','POST','PUT','DELETE'])
class Models(Resource):
    @api.doc(description="Retrieve specified models.")
    def get(self):
        if get_diagnostics(): 
            start = time.time()
            func_desc = 'Models API GET'

        try:
            conn = engine.connect()
            modelsSelect = select([models])
            modelResult = conn.execute(modelsSelect)
            modelsArray = []
            for row in modelResult:
                model = { 
                    'id': row['id'], 
                    'name': row['name'],
                    'trainingDataPath': row['trainingDataPath'],
                    'severity': row['severity'],
                    'icon': row['icon'],
                    'status': row['status']
                }
                modelsArray.append(model)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': 'GetModel', 'error_message': '', 'result': modelsArray})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem retrieving model information.', 'result': 'Failure'})

    @api.expect(ModelTemplate)
    @api.doc(description="Update an event model.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Models API POST'
        try:
            id = request.json['id']
            name = request.json['name']
            trainingDataPath = request.json['trainingDataPath']
            severity = request.json['severity']
            icon = request.json['icon']
            trainModel = request.json['trainModel']
            cancelTraining = False
            try:
                cancelTraining = request.json['cancelTraining']
            except:
                pass
            
            conn = engine.connect()
            if cancelTraining:
                # retrieve the process id

                # kill the process

                # update the status
                modelsUpdate = models.update().values(
                            status='Created',
                            pid=-1
                            ).\
                            where(models.c.id == id)
            else:
                if trainModel:
                    exeID = str(uuid.uuid4())
                    exePath = os.path.dirname(os.path.abspath(__file__))
                    exePath = exePath[:len(exePath)-5]
                    exePath = os.path.join(exePath, 'execution', 'execution.py')

                    print('Model %s will be trained in execution: %s' % (name, exeID), flush=True)

                    p = subprocess.Popen(
                        "python %s %s %s %s %s \"%s\" %s > %s/%s.log 2>&1" % (exePath, exeID, trainingDataPath, '-', '-', '-', json.dumps({}), baseDir, exeID),
                        shell=True
                    )
                    modelsUpdate = models.update().values(
                            name=name,
                            severity=severity,
                            icon=icon,
                            status='Training',
                            pid=p.pid
                            ).\
                            where(models.c.id == id)
                else:
                    modelsUpdate = models.update().values(
                            name=name,
                            severity=severity,
                            icon=icon
                            ).\
                            where(models.c.id == id)
            conn.execute(modelsUpdate)
            conn.close()

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem updating the specified model.', 'result': 'Failure'})

    @api.expect(ModelTemplate)
    @api.doc(description="Create an event model.")
    def put(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Models API PUT'

        try:
            name = request.json['name']
            trainingDataPath = request.json['trainingDataPath']
            severity = request.json['severity']
            icon = request.json['icon']
            trainModel = request.json['trainModel']

            conn = engine.connect()
            if trainModel:
                exeID = str(uuid.uuid4())
                exePath = os.path.dirname(os.path.abspath(__file__))
                exePath = exePath[:len(exePath)-5]
                exePath = os.path.join(exePath, 'execution', 'execution.py')

                print('Model %s will be trained in execution: %s' % (name, exeID), flush=True)

                p = subprocess.Popen(
                    "python %s %s %s %s %s \"%s\" %s > %s/%s.log 2>&1" % (exePath, exeID, trainingDataPath, '-', '-', '-', json.dumps({}), baseDir, exeID),
                    shell=True
                )

                modelInsert = models.insert().values(name=name,
                    trainingDataPath=trainingDataPath,
                    severity=severity,
                    icon=icon,
                    status='Training',
                    pid=p.pid)
            else:
                modelInsert = models.insert().values(name=name,
                    trainingDataPath=trainingDataPath,
                    severity=severity,
                    icon=icon)
            conn.execute(modelInsert)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem creating the specified model.', 'result': 'Failure'})

    @api.expect(ModelTemplate)
    @api.doc(description="Delete an event model.")
    def delete(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Models API DELETE'
        try:
            name = request.json['name']
            trainingDataPath = request.json['trainingDataPath']
            
            # delete the associated training data
            if os.path.exists(trainingDataPath):
                shutil.rmtree(trainingDataPath)

            conn = engine.connect()
            conn.execute(models.delete().where(models.c.name == ''+name))
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem deleting the specified model.', 'result': 'Failure'})
 