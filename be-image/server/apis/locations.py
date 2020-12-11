#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, reqparse, Resource
import glob
import os
import shutil
from sqlalchemy import text
from sqlalchemy.sql import select
import sys
import time
import traceback
import uuid
from werkzeug.utils import secure_filename
import zipfile

sys.path.append('..')

from config import baseDir, get_diagnostics
from .utils import allowed_file, print_trace
from event_database import engine, locations

api = Namespace('locations', description='Location management functions.')

LocationTemplate = api.model('Location', {
    'id': fields.String(required=True, description='A unique id that refers to the Location', example='1'),
    'name': fields.String(required=True, description='A unique name that refers to the Location', example='Dublin'),
    'gpsLatitude': fields.String(required=True, description='Latitude value in GPS coordinate format.', example='53.3498'),
    'gpsLongitude': fields.String(required=True, description='Longitude value in GPS coordinate format.', example='-6.2603'),
    'zoom': fields.Integer(required=True, description='The Zoom level for the location', example=11),    
})

@api.route('/locations', methods=['GET','POST','PUT','DELETE'])
class Locations(Resource):
    @api.doc(description="Retrieve specified location.")
    def get(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Locations API GET'

        try:
            conn = engine.connect()
            lFlag = False
            locationId = -1
            try:
                parser = reqparse.RequestParser()
                parser.add_argument('locationId', type=int, help='Location ID')
                args = parser.parse_args()
                locationId = args['locationId']
                if locationId != None:
                    lFlag = True
            except:
                pass
            
            locationsSelect = None
            if lFlag:
                locationsSelect = text("SELECT id,name,latitude,longitude,zoom FROM locations WHERE id="+str(locationId))
            else:
                locationsSelect = select([locations])
            locationResult = conn.execute(locationsSelect)
            locs = []
            for row in locationResult:
                city = { 
                    'id': row['id'],
                    'city': row['name'],
                    'latitude': row['latitude'],
                    'longitude': row['longitude'],
                    'zoom': row['zoom']
                }
                locs.append(city)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': 'GetLocation', 'error_message': '', 'result': locs})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': None, 'error_message': 'There was a problem validating the specified data set', 'result': 'Failure'})

    @api.expect(LocationTemplate)
    @api.doc(description="Update a location.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Locations API POST'

        try:
            id = request.json['id']
            name = request.json['city']
            latitude = request.json['latitude']
            longitude = request.json['longitude']
            zoom = request.json['zoom']
            
            conn = engine.connect()
            locationsUpdate = locations.update().values(name=name,
                                latitude=latitude,
                                longitude=longitude,
                                zoom=zoom).\
                                where(locations.c.id == id)
            conn.execute(locationsUpdate)
            conn.close()

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': None, 'error_message': 'There was a problem updating the specified location', 'result': 'Failure'})

    @api.expect(LocationTemplate)
    @api.doc(description="Create a location.")
    def put(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Locations API PUT'

        try:
            name = request.json['city']
            latitude = request.json['latitude']
            longitude = request.json['longitude']
            zoom = request.json['zoom']

            conn = engine.connect()
            locationInsert = locations.insert().values(name=name, latitude=latitude, longitude=longitude, zoom=zoom)
            conn.execute(locationInsert)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': None, 'error_message': 'There was a problem creating the specified location', 'result': 'Failure'})

    @api.expect(LocationTemplate)
    @api.doc(description="Delete a location.")
    def delete(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Locations API DELETE'

        try:
            name = request.json['city']
            
            conn = engine.connect()
            conn.execute(locations.delete().where(locations.c.name == ''+name))
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'location': None, 'error_message': 'There was a problem deleting the specified location', 'result': 'Failure'})
 