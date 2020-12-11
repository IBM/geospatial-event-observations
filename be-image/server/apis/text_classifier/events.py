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
from classifier.event_selector import get_event
from event_database import engine, models

api = Namespace('text_classifier/events', description='Selection of events.')

EventTemplate = api.model('Event', {
    'modelId': fields.Integer(required=True, description='A unique id that refers to the Model', example='1'),
    'startTime': fields.DateTime(required=False, description='A start date & time to filter event detection to a specific time period', example='YYYY-MM-DD HH:mm:ss'),
    'endTime': fields.DateTime(required=False, description='An end date & time to filter event detection to a specific time period', example='YYYY-MM-DD HH:mm:ss'),
    'gpsLatitude': fields.Float(required=False, description='', example=40.7588),
    'gpsLongitude': fields.Float(required=False, description='', example=-73.9851),
    'radius': fields.Integer(required=False, description='A radius, in meters, around the specified Latitude and Longitude', example=10),
    'dataPath': fields.String(required=False, description='The path to the data that should be analysed for Events', example='$AEDC_HOME/data/$DATAL_ID') 
})

@api.route('/text_classifier/events', methods=['POST'])
class Events(Resource):
    def get_request_param(self, req, param):
        try:
            return request.json[param]
        except:
            return None

    @api.expect(EventTemplate)
    @api.doc(description="selection of events.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Events API POST'

        try:
            id = -1
            error_message = ''
            modelName = ''
            keyword = None

            id = request.json['modelId']
            startTime = self.get_request_param(request, 'startTime')
            endTime = self.get_request_param(request, 'endTime')
            gpsLat = self.get_request_param(request, 'gpsLatitude')
            gpsLong = self.get_request_param(request, 'gpsLongitude')
            radius = self.get_request_param(request, 'radius')
            dataPath = self.get_request_param(request, 'dataPath')

            if id != -1:
                conn = engine.connect()
                modelSelect = text('SELECT name, keyword, trainingDataPath FROM models WHERE id=' + str(id))
                selectResult = conn.execute(modelSelect)
                
                modelPath = None
                for row in selectResult:
                    modelName = row['name']
                    modelPath = row['trainingDataPath']
                    keyword = row['keyword']
                conn.close()

                if modelPath and keyword and \
                    os.path.exists(modelPath) and \
                    os.path.exists(dataPath):
                    # retrieve the csv text data source
                    try:
                        text_file = glob.glob(os.path.join(dataPath, '*.csv'))[0]
                        text_file = text_file[text_file.rfind(os.sep) + 1:]
                    except:
                        text_file = ''

                    # check for available images
                    image_dir = os.path.join(dataPath, 'Images')
                    available_images = []
                    if os.path.exists(image_dir):
                        available_images = glob.glob(os.path.join(image_dir, '*'))

                    if (text_file and text_file != '') or len(available_images):
                        dfr, rp = get_event(dataPath, text_file, modelPath, startTime, endTime, keyword, (gpsLat, gpsLong))
                    else:
                        error_message = 'The Events API needs some text or images to analyse'
                else:
                    error_message = 'There was a problem locating the specified data to be analysed'
            else:
                error_message = 'Could not find the specified model'
            
            if get_diagnostics():
                print_trace(func_desc, start)
            
            if error_message == '':
                return jsonify({
                    'model_name': modelName,
                    'error_message': error_message,
                    'result': {
                        "event": keyword,
                        'location': (gpsLat, gpsLong),
                        'time':  endTime,
                        'posts': len(dfr),
                        'Percentage': rp*100 
                    }
                })
            else:
                return jsonify({'model_name': None, 'error_message': error_message, 'result': 'Failure'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model_name': None, 'error_message': 'There was a problem validating the specified data set', 'result': 'Failure'})