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

api = Namespace('settings', description='Application Settings management functions.')

SettingsTemplate = api.model('Setting', {
    'id': fields.Integer(required=True, description='The id of an entry in the Settings table.', example=1),
    'locations_loaded': fields.Boolean(required=True, description='Flag indicating whether the default locations have been loaded.', example=True),
    'icons_loaded': fields.Boolean(required=True, description='Flag indicating whether the default icons have been loaded.', example=True),
    'diagnostics': fields.Boolean(required=True, description='Flag indicating whether diagnostic logging is on.', example=True)   
})

@api.route('/settings', methods=['GET','POST'])
class Settings(Resource):
    @api.doc(description="Retrieve application settings.")
    def get(self):
        if get_diagnostics(): 
            start = time.time()
            func_desc = 'Settings API GET'
        try:
            conn = engine.connect()
            settingsSelect = select([settings])
            settingResult = conn.execute(settingsSelect)
            settingsArray = []
            for row in settingResult:
                setting = { 
                    'id': row['id'], 
                    'locations_loaded': row['locations_loaded'],
                    'icons_loaded': row['icons_loaded'],
                    'diagnostics': row['diagnostics'],
                    'default_location': row['default_location'],
                    'map_key': row['map_key']
                }
                settingsArray.append(setting)
            conn.close()
            
            if get_diagnostics(): 
                print_trace(func_desc, start)

            return jsonify({'setting': '', 'error_message': '', 'result': settingsArray})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start) 

            return jsonify({'setting': None, 'error_message': 'There was a problem retrieving settings information.', 'result': 'Failure'})
    
    @api.expect(SettingsTemplate)
    @api.doc(description="Update application settings.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Settings API POST'

        try:
            settingId = request.json['id']
            dlFlag = False
            defaultLocation = None
            try:
                defaultLocation = request.json['default_location']
                dlFlag = True
            except:
                pass
            
            conn = engine.connect()
            settingsUpdate = None
            diagnosticsOn = False
            if dlFlag:
                settingsUpdate = settings.update().values(
                                default_location=defaultLocation
                                ).\
                                where(settings.c.id == settingId)
            else:
                locationsLoaded = request.json['locations_loaded']
                iconsLoaded = request.json['icons_loaded']
                diagnosticsOn = request.json['diagnostics']
            
            
                settingsUpdate = settings.update().values(
                                locations_loaded=locationsLoaded, 
                                icons_loaded=iconsLoaded,
                                diagnostics=diagnosticsOn
                                ).\
                                where(settings.c.id == settingId)
            
            conn.execute(settingsUpdate)
            conn.close()

            if get_diagnostics(): 
                print_trace(func_desc, start)

            if not dlFlag: 
                set_diagnostics(diagnosticsOn)
            
            return jsonify({'setting': settingId, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'setting': None, 'error_message': 'There was a problem updating the specified application setting.', 'result': 'Failure'})