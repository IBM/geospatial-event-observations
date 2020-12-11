#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, make_response, request
from flask_restplus import fields, Namespace, Resource
import json
from multiprocessing import Manager, Process, Queue
import os
import psutil
from sqlalchemy.sql import select
import stomp
import subprocess
import sys
import threading
import time
import traceback

sys.path.append('..')

from config import baseDir, get_diagnostics, set_diagnostics
from .utils import allowed_file, print_trace
from event_database import engine, settings

api = Namespace('mui', description='MUI pipeline integration endpoint.')

broker_fields = api.model('BrokerInfo', {
    "brokerURL": fields.String(required=True, description="The URL for the ActiveMQ instance", example="stomp://activemq:61613"),
    "brokerUsername": fields.String(required=True, description="The username for the ActiveMQ instance", example="admin"),
    "brokerPassword": fields.String(required=True, description="The password for the ActiveMQ instance", example="admin"),
    "brokerQueue": fields.String(required=True, description="The target queue for the ActiveMQ instance", example="queue-eb1a463c-0775-4cdf-aa57-d9a1255d91ab")
})

data_fields = api.model('Data', { 
    "Training_Data": fields.String(required=True, description="Location of the Training Data used to train the model", example="/ASGARD_DATA/case_1/Training_Data"),
    "Input_Data": fields.String(required=True, description="Location of the data to run the Trained model on", example="/ASGARD_DATA/case_1/Input_Data"),
    "Output_Folder": fields.String(required=False, description="Location to write the output list of detected events to", example="/ASGARD_DATA/case_1/Events"),
    "taskId": fields.String(required=True, description="Unique ID for this run of the event detection tool", example="86fa96db-9834-49ad-8ab4-9841906f87d9"),
    "brokerInfo": fields.Nested(broker_fields)
})

PostTemplate = api.model('PipelinePost', {
    'operation': fields.String(required=True, description='The MUI Pipeline operation to be performed', example='REQ_START'),
    'reason': fields.String(required=True, description='The intended nature of the request', example='Start tool processing'),
    'data': fields.Nested(data_fields)
})

mutex = threading.Lock()
manager = Manager()
taskIds = manager.dict()

@api.route('/mui', methods=['GET', 'POST', 'DELETE'])
@api.route('/mui/<taskId>', methods=['GET', 'POST', 'DELETE'])
class MUI(Resource):
    #INF_PROCESSING = {
    #    "operation": "INF_PROCESSING",
    #    "reason": "Training model...",
    #    "message": "Trianing model...",
    #    "percentage": 25,
    #    "eta": 15
    #}
    #RES_COMPLETED = {
    #    "operation": "INF_PROCESSING",
    #    "reason": "Execution completed.",
    #    "data": {
    #        "output_file": "/ASGARD_DATA/case_1/case_003/detected_events.csv"
    #    } 
    #}

    def cancel_task(self, pid):
        p = psutil.Process(pid)
        for sp in p.children(recursive=True):
            sp.kill()
        p.kill()

    def get_error_status(self, reason, message):
        return {
            "operation": "RES_FAILED",
            "reason": reason,
            "message": message
        }

    @api.doc(description="Retrieve the status of the Geospatial Event Detection execution.")
    def get(self, taskId=None):
        global taskIds
        if get_diagnostics():
            start = time.time()
            func_desc = 'MUI Endpoint API GET'

        responseObject = {
            "taskIds": [],
            "error_message": "",
            "result": "Success"
        }

        try:
            if taskId:
                task = taskIds[taskId]
                task["taskId"] = taskId
                responseObject["taskIds"].append(task)
            else:
                for taskId in taskIds.keys():
                    task = taskIds[taskId]
                    task["taskId"] = taskId
                    responseObject["taskIds"].append(task)
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify(responseObject)
        except:
            traceback.print_exc()
            responseObject["error_message"] = "An exception was thrown. Please contact the tool owner."
            responseObject["result"] = "Failure"
            if get_diagnostics(): 
                print_trace(func_desc, start)

            return jsonify(responseObject)
    
    @api.doc(description="Start the Geospatial Event Detection execution.")
    @api.response(202, 'Tool request accepted.')
    @api.expect(PostTemplate)
    def post(self, taskId=None):
        global mutex
        global taskIds
        if get_diagnostics():
            start = time.time()
            func_desc = 'MUI Endpoint API POST'

        error_message = ''
        responseCode = 202

        try:
            #{
            #    "reason": "Start Tool Processing",
            #    "operation": "REQ_START",
            #    "data": {
            #        "Training_Data": "/ASGARD_DATA/case_1/previous_shootings",
            #        "Input_Data": "/ASGARD_DATA/case_1/case_003",
            #        "brokerInfo": {
            #            "brokerURL": "stomp://activemq:61613",
            #            "brokerUsername": "admin",
            #            "brokerPassword": "admin",
            #            "brokerQueue": "queue-eb1a463c-0775-4cdf-aa57-d9a1255d91ab"
            #        }, 
            #        "taskId": "86fa96db-9834-49ad-8ab4-9841906f87d9"
            #    }
            #}
            print(json.dumps(request.json))
            taskId = request.json['data']['taskId']
            MQInfo = request.json['data']['brokerInfo']
            trainingDataPath = request.json['data']['Training_Data']
            inputDataPath = request.json['data']['Input_Data']
            outputDataPath = request.json['data']['Output_Folder']
            if not os.path.exists(outputDataPath):
                outputDataPath = inputDataPath

            result = {
                "operation": "RES_STARTED",
                "reason": "Event detection job starting..."
            }

            # verify training data and input data availability
            if os.path.exists(trainingDataPath):
                if os.path.exists(inputDataPath):
                    print('Setting up a new job')
                    exePath = os.path.dirname(os.path.abspath(__file__))
                    exePath = exePath[:len(exePath)-5]
                    exePath = os.path.join(exePath, 'execution', 'execution.py')
                    print(exePath)
                    mqinfo = json.dumps(MQInfo).replace(' ','').replace('"', '\\"')
                    print(mqinfo)
                    p = subprocess.Popen(
                        "python %s %s %s %s %s \"%s\" %s > /app/static/%s.log 2>&1" % (exePath, taskId, trainingDataPath, inputDataPath, outputDataPath, mqinfo, json.dumps({}), taskId),
                        shell=True
                    )

                    with mutex:
                        taskIds[taskId] = {
                            "pid": p.pid,
                            "outputDataPath": outputDataPath
                        }
                else:
                    error_reason = 'Input Data location specified does not exist or there is no data'
                    error_message = 'Please check the Input Data'
                    result = self.get_error_status(error_reason, error_message)
                    responseCode = 404
            else:
                error_reason = 'Training Data location specified does not exist or there is no data'
                error_message = 'Please check the Training Data'
                result = self.get_error_status(error_reason, error_message)
                responseCode = 404

            if get_diagnostics(): 
                print_trace(func_desc, start)

            if error_message == '':
                return make_response(jsonify(result), responseCode)
            else:
                return make_response(jsonify(result), responseCode)
        except:
            traceback.print_exc()
            error_reason = 'An exception was thrown'
            error_message = traceback.format_exc()
            responseCode = 500
            result = self.get_error_status(error_reason, error_message)
            if get_diagnostics(): 
                print_trace(func_desc, start)
            return make_response(jsonify(result), responseCode)
    
    @api.doc(description="Cancel the Geospatial Event Detection execution.")
    def delete(self, taskId=None):
        global mutex
        global taskIds
        if get_diagnostics():
            start = time.time()
            func_desc = 'MUI Endpoint API DELETE'

        error_message = ''
        responseCode = 200
        result = {
            "operation": "RES_CANCELLED",
            "reason": "User requested job cancellation",
            "message": "Execution job cancelled"
        }

        try:
            if taskId and (taskId in taskIds):
                try:
                    # kill the process
                    self.cancel_task(taskIds[taskId]["pid"])
                    # clean the output
                    outputDataPath = taskIds[taskId]["outputDataPath"]
                    outputFile = os.path.join(outputDataPath, 'detected-events.csv')
                    if os.path.exists(outputFile):
                        os.remove(outputFile)
                except:
                    pass

                # remove from the tasks dict
                with mutex:
                    del taskIds[taskId]
            else:
                error_reason = 'Invalid taskId paramter'
                error_message = 'The taskId sent with the request is invalid or not currently being executed'
                result = self.get_error_status(error_reason, error_message)
                responseCode = 404

            if get_diagnostics():
                print_trace(func_desc, start)

            return make_response(jsonify(result), responseCode)
        except:
            traceback.print_exc()
            error_reason = 'An exception was thrown'
            error_message = traceback.format_exc()
            responseCode = 500
            result = self.get_error_status(error_reason, error_message)
            if get_diagnostics():
                print_trace(func_desc, start)

            return make_response(jsonify(result), responseCode)