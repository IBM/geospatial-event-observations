#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
import glob
import os
from sqlalchemy.sql import text
import sys
import time
import traceback

sys.path.append('..')

from ..utils import print_trace

sys.path.append('../..')

from config import baseDir, get_diagnostics
from classifier.image_classifier import evaluate
from event_database import engine, models

api = Namespace('image_classifier/validate', description='Validation of Trained models.')

ValidateImageModelTemplate = api.model('ValidateImageModel', {
    'id': fields.Integer(required=True, description='A unique id that refers to the Model', example='1')
})

@api.route('/image_classifier/validate', methods=['POST'])
class Validate(Resource):
    @api.expect(ValidateImageModelTemplate)
    @api.doc(description="Validate the trained model.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Image Classifier Validate API POST'

        try:
            id = -1
            error_message = ''
            modelName = ''
            modelStatus = ''

            id = request.json['id']

            if id != -1:
                conn = engine.connect()
                modelSelect = text('SELECT name, status, trainingDataPath FROM models WHERE id='+str(id))
                selectResult = conn.execute(modelSelect)

                modelPath = None
                for row in selectResult:
                    modelName = row['name']
                    modelStatus = row['status']
                    modelPath = row['trainingDataPath']
                conn.close()
                
                if modelStatus == 'Trained':
                    if modelPath and os.path.exists(os.path.join(modelPath, 'Images')):
                        spath = os.path.join(os.path.abspath('.'), 'classifier')
                        path = os.path.join(modelPath, 'Images')
                        image_size = (56,56)
                        n_classes = len(glob.glob(os.path.join(path,'train','*')))
                        
                        report = evaluate(spath, path, image_size, n_classes)
                    else:
                        error_message = 'There are no images in the models training data'
                else:
                    error_message = 'The specified model has not been trained yet. Validation can only be run on trained models.'
            else:
                error_message = 'Could not find the specified model'

            if get_diagnostics():
                print_trace(func_desc, start)
            
            if error_message == '':
                return jsonify({'model_name': modelName, 'error_message': error_message, 'result': report})
            else:
                return jsonify({'model_name': 'ValidateImages', 'error_message': error_message, 'result': ''})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model_name': None, 'error_message': 'There was a problem validating the specified data set', 'result': 'Failure'})