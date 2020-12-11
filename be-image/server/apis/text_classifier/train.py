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
from classifier.short_text_classifier import training_text_classifier
from event_database import engine, models

api = Namespace('text_classifier/train', description='Train the algorithm to produce a model.')

TrainTextModelTemplate = api.model('TrainTextModel', {
    'id': fields.Integer(required=True, description='A unique id that refers to the Model', example='1')
})

@api.route('/text_classifier/train', methods=['POST'])
class Train(Resource):
    @api.expect(TrainTextModelTemplate)
    @api.doc(description="Train the algorithm to produce a model.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Text Classifier Train API POST'

        try:
            id = -1
            error_message = ''
            modelName = ''

            id = request.json['id']
            short_text = 'training_text.csv'
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
                    os.path.exists(os.path.join(modelPath, short_text)) and \
                    os.path.exists(os.path.join(modelPath, real_time)):
                    report = training_text_classifier(modelPath, short_text, real_time)
                else:
                    error_message = 'There was a problem locating the specified training data'
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

            return jsonify({'model_name': None, 'error_message': 'There was a problem training the specified data set', 'result': 'Failure'})