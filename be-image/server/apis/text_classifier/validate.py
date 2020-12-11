#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
import os
from sqlalchemy.sql import text
import sys
import time
import traceback

sys.path.append('..')

from ..utils import print_trace

sys.path.append('../..')

from config import baseDir, get_diagnostics
from classifier.short_text_classifier import val_text_classifier
from event_database import engine, models

api = Namespace('text_classifier/validate', description='Validation of Trained models.')

ValidateTextModelTemplate = api.model('ValidateTextModel', {
    'id': fields.Integer(required=True, description='A unique id that refers to the Model', example='1')
})

@api.route('/text_classifier/validate', methods=['POST'])
class Validate(Resource):
    @api.expect(ValidateTextModelTemplate)
    @api.doc(description="Validate the trained model.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Text Classifier Validate API POST'

        try:
            id = -1
            error_message = ''
            modelName = ''

            id = request.json['id']
            real_time = 'valid_text.csv'

            if id != -1:
                conn = engine.connect()
                modelSelect = text('SELECT name, trainingDataPath FROM models WHERE id=' + str(id))
                selectResult = conn.execute(modelSelect)
                
                modelPath = None
                for row in selectResult:
                    modelName = row['name']
                    modelPath = row['trainingDataPath']
                conn.close()

                if modelPath and \
                    os.path.exists(os.path.join(modelPath, real_time)):
                    report = val_text_classifier(modelPath, real_time)
                else:
                    error_message = 'There was a problem locating the specified validation data'
            else:
                error_message = 'Could not find the specified model'

            if get_diagnostics():
                print_trace(func_desc, start)
            
            if error_message == '':
                return jsonify({'model_name': modelName, 'error_message': error_message, 'result': report})
            else:
                return jsonify({'model_name': None, 'error_message': error_message, 'result': 'Failure'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model_name': None, 'error_message': 'There was a problem validating the specified data set', 'result': 'Failure'})