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
from classifier.image_classifier import train_model
from event_database import engine, models


api = Namespace('image_classifier/train', description='Train the algorithm to produce a model.')

TrainImageModelTemplate = api.model('TrainImageModel', {
    'id': fields.Integer(required=True, description='A unique id that refers to the Model', example='1'),
    'fullTrain': fields.Boolean(required=False, descriptio='A flag indicating that a full train cycle should be performed.\
                                    Any previous training artifacts will be deleted.', example=False)
})

@api.route('/image_classifier/train', methods=['POST'])
class Train(Resource):
    @api.expect(TrainImageModelTemplate)
    @api.doc(description="Train the algorithm to produce a model.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Image Classifier Train API POST'

        try:
            id = -1
            Full_train = False
            error_message = ''
            saved_path = ''
            loss = -1
            acc = -1
            modelName = ''

            id = request.json['id']
            try:
                Full_train = request.json['fullTrain']
            except:
                pass

            if id != -1:
                conn = engine.connect()
                modelSelect = text('SELECT name, trainingDataPath FROM models WHERE id='+str(id))
                selectResult = conn.execute(modelSelect)

                modelPath = None
                for row in selectResult:
                    modelName = row['name']
                    modelPath = row['trainingDataPath']
                conn.close()

                if modelPath and os.path.exists(os.path.join(modelPath, 'Images')):
                    spath = os.path.join(os.path.abspath('.'), 'classifier')
                    path = os.path.join(modelPath, 'Images')
                    image_size = (56, 56)
                    n_classes = len(glob.glob(os.path.join(path, 'train', '*')))

                    if Full_train:
                        saved_path, loss, acc = train_model(spath, path, image_size, n_classes, Full_train)
                    else:
                        saved_path, loss, acc = train_model(spath, path, image_size, n_classes)
                else:
                    error_message = 'There are no images in the models training data'
            else:
                error_message = 'Could not find the specified model'

            if get_diagnostics():
                print_trace(func_desc, start)
            
            if error_message == '':
                return jsonify({'model_name': modelName, 'error_message': error_message, 'result': {'model_location': saved_path, 'loss': loss, 'accuracy': acc}})
            else:
                return jsonify({'model_name': None, 'error_message': error_message, 'result': {}})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model_name': None, 'error_message': 'There was a problem validating the specified data set', 'result': 'Failure'})