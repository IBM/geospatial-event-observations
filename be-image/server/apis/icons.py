#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
import glob
import io
import os
from PIL import Image
import shutil
from sqlalchemy.sql import select
import sys
import time
import traceback
import uuid
from werkzeug.utils import secure_filename
import zipfile

sys.path.append('..')

from config import baseDir, get_diagnostics
from .utils import allowed_file, allowed_image_file, print_trace
from event_database import engine, icons, locations, models

api = Namespace('icons', description='Map marker icon management functions.')

IconTemplate = api.model('Icon', {
    'id': fields.String(required=True, description='A unique id that refers to the Icon', example='1'),
    'type': fields.String(required=True, description='The type of the icon', example='file,font-awesome'),
    'examples': fields.String(required=True, description='A short description of possible associated models', example='fire, arson'),
    'location': fields.String(required=True, description='The path to the file or the FA class to be used', example='fa-ambulance, icon.png')
})

@api.route('/icons', methods=['GET','POST','PUT','DELETE'])
class Icons(Resource):
    @api.doc(description="Retrieve specified icons.")
    def get(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Icons API GET'

        try:
            conn = engine.connect()
            iconsSelect = select([icons])
            iconResult = conn.execute(iconsSelect)
            iconsArray = []
            for row in iconResult:
                icon = { 
                    'id': row['id'], 
                    'type': row['type'],
                    'examples': row['examples'],
                    'location': row['location']
                }
                iconsArray.append(icon)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': '', 'error_message': '', 'result': iconsArray})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': None, 'error_message': 'There was a problem retrieving icon information.', 'result': 'Failure'})

    @api.expect(IconTemplate)
    @api.doc(description="Update an icon.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Icons API POST'
        try:
            iconId = request.json['id']
            iconType = request.json['type']
            iconExamples = request.json['examples']
            iconLocation = request.json['location']
            
            conn = engine.connect()
            iconsUpdate = icons.update().values(
                                type=iconType, 
                                examples=iconExamples, 
                                location=iconLocation
                                ).\
                                where(icons.c.id == iconId)
            conn.execute(iconsUpdate)
            conn.close()

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': iconLocation, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': None, 'error_message': 'There was a problem updating the specified icon.', 'result': 'Failure'})

    @api.expect(IconTemplate)
    @api.doc(description="Create an icon.")
    def put(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Icons API PUT'

        try:
            iconType = ''
            iconExamples = ''
            iconLocation = ''
            if 'file' not in request.files:
                iconType = request.json['type']
                iconExamples = request.json['examples']
                iconLocation = request.json['location']
            else:
                iconFile = request.files['file']
                if iconFile and allowed_image_file(iconFile.filename):
                    # check the image is ok for an icon
                    iconFile.seek(0)
                    targetImage = Image.open(iconFile)
                
                    if targetImage.width <= 64 and targetImage.height <= 64:
                        # save the icon file to disk
                        iconFilename = secure_filename(iconFile.filename)
                        thisDir = os.path.dirname(__file__)
                        serverDir = thisDir[:len(thisDir)-5]
                        iconFile.save(os.path.join(serverDir,'static',iconFilename))
                        iconType = 'file'
                        iconExamples = request.form['examples']
                        iconLocation = iconFilename
                    else:
                        if get_diagnostics():
                            print_trace(func_desc, start)

                        return jsonify({'icon': None, 'error_message': 'The image file uploaded is too large (max 64x64).', 'result': 'Failure'})
                else:
                    if get_diagnostics():
                        print_trace(func_desc, start)

                    return jsonify({'icon': None, 'error_message': 'No file or unsupported file type uploaded.', 'result': 'Failure'})

            conn = engine.connect()
            iconInsert = icons.insert().values(type=iconType,
                    examples=iconExamples, 
                    location=iconLocation)
            conn.execute(iconInsert)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': iconLocation, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': None, 'error_message': 'There was a problem creating the specified icon.', 'result': 'Failure'})

    @api.expect(IconTemplate)
    @api.doc(description="Delete an icon.")
    def delete(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Icons API DELETE'

        try:
            iconId = request.json['id']
            iconType = request.json['type']
            iconLocation = request.json['location']
            
            # if file delete the FS artifact 
            if iconType == 'file':
                thisDir = os.path.dirname(__file__)
                serverDir = thisDir[:len(thisDir)-5]
                iconFilePath = os.path.join(serverDir, 'static', iconLocation)
                if os.path.isfile(iconFilePath):
                    os.remove(iconFilePath)    

            conn = engine.connect()
            conn.execute(icons.delete().where(icons.c.id == iconId))
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': iconLocation, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'icon': None, 'error_message': 'There was a problem deleting the specified icon.', 'result': 'Failure'})