#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, make_response, request, Response
from flask_restplus import fields, Namespace, Resource
import glob
import json
from multiprocessing import Manager
import os
import shutil
from sqlalchemy.sql import select
import subprocess
import sys
import threading
import time
import traceback
import uuid
from werkzeug.utils import secure_filename
import zipfile

sys.path.append('..')

from config import baseDir, get_diagnostics
from .utils import allowed_file, print_trace
from event_database import engine, models

api = Namespace('updates', description='API for Server Sent Events.')

mutex = threading.Lock()
manager = Manager()
updates = manager.dict()

@api.route('/updates', methods=['GET','POST'])
class Updates(Resource):
    @api.doc(description="Updates Persistent Connection.")
    def get(self):
        global mutex
        global updates
        if get_diagnostics(): 
            start = time.time()
            func_desc = 'Updates API GET'

        try:
            if get_diagnostics():
                print_trace(func_desc, start)

            eventStr = ''
            with mutex:
                for key in updates:
                    eventStr += 'event: %s\ndata: {}\n\n' % key
                updates.clear()
            
            print('Updates to be sent: '+eventStr)
            #if updateType:
            response = make_response(eventStr)
            response.headers['Content-Type'] = 'text/event-stream'
            #else:
            #    response = Response(mimetype="text/event-stream")
            
            response.headers['Connection'] = 'keep-alive'
            response.headers['Cache-Control'] = 'no-cache'
            return response
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem calling api/v1.0/updates GET.', 'result': 'Failure'})

    @api.doc(description="Post the type of update made on the Server Side.")
    def post(self):
        global mutex
        global updates
        if get_diagnostics():
            start = time.time()
            func_desc = 'Models API POST'
        try:
            updateType = request.json['type']

            if updateType == 'models':
                print('We need to update the models type')
                with mutex:
                    updates['models'] = True    
            elif updateType == 'events':
                print('We need to update the events type')
                with mutex:
                    updates['events'] = True
            else:
                print('Unrecognised')

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem calling api/v1.0/update POST.', 'result': 'Failure'})
 