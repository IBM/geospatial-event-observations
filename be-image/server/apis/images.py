#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request, send_file
from flask_restplus import fields, Namespace, Resource
import glob
import json
import mimetypes
import os
import pathlib
import shutil
import sys
import time
import traceback
import uuid
from werkzeug.utils import secure_filename
import zipfile

sys.path.append('..')

from config import baseDir, get_diagnostics
from .utils import allowed_file, print_trace

api = Namespace('images', description='Event Image retrieval API.')

@api.route('/images', methods=['GET'])
class Images(Resource):
    @api.doc(description="Retrieve specified image.")
    def get(self):
        if get_diagnostics(): 
            start = time.time()
            func_desc = 'Images API GET'

        try:
            imgPath = request.args.get('img')
            print(imgPath)
            imgFullPath = os.path.join(baseDir, imgPath)
            print(imgFullPath)
            mimeType, mimeEncoding = mimetypes.guess_type(pathlib.Path(imgFullPath).as_uri())

            if get_diagnostics():
                print_trace(func_desc, start)

            return send_file(imgFullPath,
                    attachment_filename=imgPath[imgPath.rfind('/')+1:],
                    mimetype=mimeType)
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem retrieving image file.', 'result': 'Failure'})
 