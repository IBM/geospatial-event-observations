#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
from concurrent.futures import ThreadPoolExecutor
import glob
import os
import shutil
import sys
import time
import traceback
import uuid
from werkzeug.utils import secure_filename
import zipfile

sys.path.append('..')

from config import baseDir, get_diagnostics 
from .utils import allowed_file, print_trace, threaded_execution
from event_database import engine, datasources

api = Namespace('data', description='Dataset management functions.')

CreateDatasetTemplate = api.model('CreateDataset', {
    'name': fields.String(required=False, description='An Optional name that refers to the Dataset', example='MyDataset'),
    'storageType': fields.String(required=True, description='Storage type for the Dataset to use. Database, local filesystem, WebHook', example='Database, Filesystem, Webhook'),
    'type': fields.String(required=True, description='Type of the Dataset to be created. Text, Images and Video can be classified.', example='Text, Image, Video')    
})

DeleteDatasetTemplate = api.model('DeleteDataset', {
    'uuid': fields.String(required=True, description='Name of the Test data', example='zipkin-master'),
    'storageType': fields.String(required=True, description='Storage type for the Dataset to be deleted. Database, local filesystem, WebHook', example='Database, Filesystem, Webhook')
})

@api.route('/data', methods=['GET','POST','PUT','DELETE'])
class Data(Resource):
    def get_filesystem_datasets(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'DATA API get_filesystem_datasets'

        fsDatasets = glob.glob(os.path.join(baseDir, '**'))
        #for fsDataset in fsDatasets:
        #    print(fsDataset)
        if get_diagnostics():
            print_trace(func_desc, start)

        return fsDatasets

    def save_filesystem_dataset(self, request, targetDir, dsUUID):
        if get_diagnostics():
            start = time.time()
            func_desc = 'DATA API save_filesystem_dataset'

        try:
            if os.path.exists(baseDir):
                if not os.path.exists(targetDir):
                    os.mkdir(targetDir)
            else:
                os.mkdir(baseDir)
                os.mkdir(targetDir)

            # write the zip file
            # check if the put request has the file part
            if 'file' not in request.files:
                return False

            file = request.files['file']
            # if user does not select file, browser also
            # submit an empty part without filename
            if file.filename == '':
                return False
        
            dataZipFile = ""
            if file and allowed_file(file.filename):
                dataZipFile = secure_filename(file.filename)
                file.save(os.path.join(targetDir, dataZipFile))
        
            # extract the data archive
            with zipfile.ZipFile(os.path.join(targetDir, dataZipFile), "r") as z:
                z.extractall(targetDir)
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return True
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return False

    @api.doc(description="Retrieve specified dataset.")
    def get(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'DATA API GET'

        try:
            dirs = self.get_filesystem_datasets()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'dataset': '', 'error_message': '', 'result': dirs})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model_name': None, 'error_message': 'There was a problem validating the specified data set', 'result': 'Failure'})
    
    @api.doc(description="Update a dataset.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'DATA API POST'

        try:
            datasetType = request.form['type']
            print('Dataset Type: ' + datasetType)
            storageType = request.form['storageType']
            print('Storage Type: ' + storageType)
            datasetName = request.form['name']
            print('Name: ' + datasetName)
            dsUUID = request.form['uuid']
            print('UUID: ' + dsUUID)

            # storage action
            if storageType == 'Filesystem':
                print('Filesystem storage...')
                targetDir = os.path.join(baseDir, dsUUID)

                # delete existing contents
                if os.path.exists(targetDir):
                    for content in os.listdir(targetDir):
                        if content != 'settings.json':
                            delPath = os.path.join(targetDir, content)
                            try:
                                shutil.rmtree(delPath)
                            except:
                                os.remove(delPath)
                
                # save the dataset file
                datasetSaved = self.save_filesystem_dataset(request, targetDir, dsUUID)
                if not datasetSaved:
                    if get_diagnostics():
                        print_trace(func_desc, start)

                    return jsonify({'dataPath': '', 'error_message': 'There was a problem saving the dataset to the filesystem.', 'result': 'Failure'})
            elif storageType == 'Database':
                print('Database storage...')

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'dataPath': targetDir, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'dataPath': None, 'error_message': 'Error updating the specified data set', 'result': 'Failure'})
    
    @api.expect(CreateDatasetTemplate)
    @api.doc(description="Create a dataset.")
    def put(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'DATA API PUT'
        try:
            datasetType = request.form['type']
            print('Dataset Type: ' + datasetType)
            storageType = request.form['storageType']
            print('Storage Type: ' + storageType)
            datasetName = request.form['name']
            print('Name: ' + datasetName)
            # create a uuid for the new dataset
            dsUUID = str(uuid.uuid4())
            print('UUID: ' + dsUUID)
            # storage action
            if storageType == 'Filesystem':
                print('Filesystem storage...')
                targetDir = os.path.join(baseDir, dsUUID)
                # save the dataset file
                datasetSaved = self.save_filesystem_dataset(request, targetDir, dsUUID)
                if not datasetSaved:
                    if get_diagnostics():
                        print_trace(func_desc, start)

                    return jsonify({'dataPath': '', 'error_message': 'There was a problem saving the dataset to the filesystem.', 'result': 'Failure'})

                if datasetType == 'training':
                    # create a settings.json for the dataset
                    with open(os.path.join(targetDir, "settings.json"), "w+") as settingsFile:
                        settingsFile.write('{"name": "' + datasetName + '", "data_path": "' + targetDir 
                            + '", "Mode": "score", "word_vectors": "glove_twitter_27B_50d", "filters": 200, "maxlen": 6}')
            elif storageType == 'Database':
                print('Database storage...')

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'dataPath': targetDir, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'dataPath': None, 'error_message': 'Error creating the specified dataset', 'result': 'Failure'})
    
    @api.expect(DeleteDatasetTemplate)
    @api.doc(description="Delete a dataset.")
    def delete(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'DATA API DELETE'

        targetUUID = ""
        storageType = ""
        try:
            targetUUID = request.json["uuid"]
            storageType = request.json["storageType"]
            
            if storageType == 'Filesystem':
                targetDir = os.path.join(baseDir, targetUUID)
                
                # make sure not to delete the sqlite DB
                if targetUUID != 'event-detection.db' and os.path.exists(os.path.join(baseDir, targetUUID)):
                    shutil.rmtree(targetDir)
                    return jsonify({'dataset': targetUUID, 'error_message': '', 'result': 'Success'})

                if get_diagnostics():
                    print_trace(func_desc, start)

                return jsonify({'dataset': targetUUID, 'error_message': 'The specified dataset does not exist.', 'result': 'Failure'})
            elif storageType == 'Database':
                print('Delete Database dataset')
            elif storageType == 'WebHook':
                print('Delete WebHook Dataset')
        except:
            traceback.print_exc()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'dataset': targetUUID, 'error_message': 'There was a problem deleting the specified dataset.', 'result': 'Failure'})