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

api = Namespace('i2/acquire', description='i2 Connect Acquire Interactions.')

@api.route('/i2/acquire', methods=['POST'])
class Acquire(Resource):
    @api.doc(description="Acquire functions.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'i2/Acquire API POST'

        try:
            if get_diagnostics():
                print_trace(func_desc, start)
            
            return jsonify({'i2_name': 'Acquire', 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'i2_name': 'Acquire', 'error_message': 'There was a problem acquiring data for i2', 'result': 'Failure'})