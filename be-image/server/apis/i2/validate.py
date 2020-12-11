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

api = Namespace('i2/validate', description='i2 Connect Validate Interactions.')

@api.route('/i2/validate', methods=['POST'])
class Acquire(Resource):
    @api.doc(description="Validate functions.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'i2/Validate API POST'

        try:
            if get_diagnostics():
                print_trace(func_desc, start)
            
            return jsonify({'i2_name': 'Validate', 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'i2_name': 'Validate', 'error_message': 'There was a problem validating data for i2', 'result': 'Failure'})