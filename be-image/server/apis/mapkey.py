#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
from sqlalchemy.sql import select
import sys
import time
import traceback

sys.path.append('..')

from config import baseDir, get_diagnostics, set_diagnostics
from .utils import allowed_file, print_trace
from event_database import engine, settings

api = Namespace('mapkey', description='Mapbox API Key management functions.')

MapKeyTemplate = api.model('MapKey', {
    'key': fields.String(required=True, description='The Mapbox API Key to be saved.', example='aKey')   
})

@api.route('/mapkey', methods=['GET','POST'])
class MapKey(Resource):
    @api.doc(description="Retrieve Mapbox API Key.")
    def get(self):
        if get_diagnostics(): 
            start = time.time()
            func_desc = 'MapKey API GET'
        try:
            conn = engine.connect()
            settingsSelect = select([settings])
            settingResult = conn.execute(settingsSelect)
            mapkey = ''
            for row in settingResult:
                mapkey = row['map_key']

            conn.close()
            
            if get_diagnostics(): 
                print_trace(func_desc, start)

            return jsonify({'mapkey': '', 'error_message': '', 'result': mapkey})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start) 

            return jsonify({'mapkey': None, 'error_message': 'There was a problem retrieving the Mapbox API Key.', 'result': 'Failure'})
    
    @api.expect(MapKeyTemplate)
    @api.doc(description="Update Mapbox API Key.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'MapKey API POST'

        try:
            mapkey = request.json['key']
            
            conn = engine.connect()
            settingsUpdate = None
            diagnosticsOn = False
            settingsUpdate = settings.update().values(
                                    map_key=mapkey
                                ).\
                                where(settings.c.id == 1)
            
            conn.execute(settingsUpdate)
            conn.close()

            if get_diagnostics(): 
                print_trace(func_desc, start)
            
            return jsonify({'mapkey': '', 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'mapkey': None, 'error_message': 'There was a problem setting the Mapbox API Key.', 'result': 'Failure'})