#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
import glob
import json
import numpy as np
import os
import pandas as pd
import requests
from sqlalchemy import text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import stomp
import sys
import time
import traceback

sys.path.append('..')

from classifier.image_classifier import evaluate, score, train_model
from classifier.short_text_classifier import score_text_classifier, training_text_classifier, val_text_classifier
from config import baseDir, get_diagnostics, set_diagnostics

db_path = os.path.join(baseDir, 'event-detection.db')
Base = declarative_base()
engine = create_engine('sqlite:///'+db_path, poolclass=QueuePool, connect_args={'check_same_thread': False})
Session = sessionmaker(bind=engine)

def count_files(aPath):
    return len(os.listdir(aPath))

def create_activeMQ_connection(MQInfo):
    if get_diagnostics(): start = time.time()
    try:
        # parse broker info
        activeMQHost = MQInfo['brokerURL'].split(':')[1]
        # remove the stomp:// protocol declaration
        activeMQHost = activeMQHost[2:]
        print(activeMQHost)
        activeMQPort = int(MQInfo['brokerURL'].split(':')[2])
        print(activeMQPort)
        
        # connect to the activeMQ instance
        stompConnection = stomp.Connection([(activeMQHost, activeMQPort)])
        stompConnection.start()
        stompConnection.connect(MQInfo['brokerUsername'], MQInfo['brokerPassword'], wait=True)

        if get_diagnostics():
            end = time.time()
            print('%s Create ActiveMQ Connection completed in %f s' %(time.ctime(end), end-start), flush=True)

        return stompConnection
    except:
        traceback.print_exc()
        if get_diagnostics():
            end = time.time()
            print('%s Create ActiveMQ Connection completed in %f s' %(time.ctime(end), end-start), flush=True)
        return None

def send_execution_status(taskId, MQInfo, status):
    # set up the stomp connection
    MQConnection = create_activeMQ_connection(MQInfo)
    if MQConnection:
        print('Sending message to queue')
        # subscribe to the queue
        MQConnection.subscribe(MQInfo['brokerQueue'], taskId)
        
        # send the status
        MQConnection.send(MQInfo['brokerQueue'], json.dumps(status), 'application/json')
        #MQConnection.send(body=json.dumps(status), destination=MQInfo['brokerQueue'])

        # disconnect
        MQConnection.disconnect()

if __name__ == "__main__":
    try:
        # MQ flag
        sendMQMessages = True
        # turn on Trace
        set_diagnostics(True)

        # parse command line args
        print(sys.argv[1])
        taskId = sys.argv[1]
        print(sys.argv[2])
        trainingDataPath = sys.argv[2]
        print(sys.argv[3])
        inputDataPath = sys.argv[3]
        print(sys.argv[4])
        outputDataPath = sys.argv[4]
        
        try:
            print(sys.argv[5])
            MQInfo = json.loads(sys.argv[5])
        except:
            print('There was a problem parsing MQ Info')
            traceback.print_exc()
            sendMQMessages = False

        print(sys.argv[6])
        status = json.loads(sys.argv[6])

        # classifier path
        classifierPath = os.path.dirname(os.path.abspath(__file__))
        classifierPath = classifierPath[:classifierPath.rfind('/')]
        classifierPath = os.path.join(classifierPath, 'classifier')
        print(classifierPath)

        # control flags
        builtImageModel = False
        builtTextModel = False

        # text training files
        short_text = 'training_text.csv'
        real_time = 'valid_text.csv'

        # image structure info
        image_size = (56, 56)
        imgFolder = 'Images'
        imgTrainFolder = 'train'
        imgValidFolder = 'valid'
        imgTestFolder = 'test'

        if trainingDataPath != '-':
            # try to estimate progress
            imagesFolder = os.path.join(trainingDataPath, imgFolder)
            keyword = os.listdir(os.path.join(imagesFolder, imgTrainFolder))[0]
            totalTrainImages = count_files(os.path.join(imagesFolder, imgTrainFolder, keyword))
            totalValidImages = count_files(os.path.join(imagesFolder, imgValidFolder, keyword))
            totalTestImages = count_files(os.path.join(imagesFolder, imgTestFolder, keyword))
            totalImages = totalTrainImages + totalValidImages + totalTestImages

            print('Building models...')
            if sendMQMessages:
                status = {
                    "operation": "INF_PROCESSING",
                    "reason": "Training models...",
                    "message": "Training models...",
                    "percentage": 0.0,
                    "eta": 180
                }
                send_execution_status(taskId, MQInfo, status)

        # image training
        if trainingDataPath != '-' and totalImages:
            n_classes = 2
            model_path, loss, acc = train_model(classifierPath, imagesFolder, image_size, n_classes, True)
            builtImageModel = True
            
            print('Built image model...')
            if sendMQMessages:
                status = {
                    "operation": "INF_PROCESSING",
                    "reason": "Image model created...",
                    "message": "Image model created...",
                    "percentage": 0.2,
                    "eta": 120
                }
                send_execution_status(taskId, MQInfo, status)

        # text training
        if trainingDataPath != '-' and os.path.exists(os.path.join(trainingDataPath, short_text)) and \
            os.path.exists(os.path.join(trainingDataPath, real_time)):
            report = training_text_classifier(trainingDataPath, short_text, real_time)
            print(report)
            builtTextModel = True
            
            print('Built short text model...')
            if sendMQMessages:
                status = {
                    "operation": "INF_PROCESSING",
                    "reason": "Text model created...",
                    "message": "Text model created...",
                    "percentage": 0.4,
                    "eta": 90
                }
                send_execution_status(taskId, MQInfo, status)
            
            # update the DB
            sql = text('UPDATE models SET status="Trained", pid=-1 WHERE trainingDataPath="'+trainingDataPath+'";')
            result = engine.execute(sql)

            # update the SSE API
            requests.post('http://localhost:5000/api/v1.0/updates', json={"type": "models"})

        if inputDataPath != '-':
            print('Scoring input data...')
            if sendMQMessages:
                status = {
                    "operation": "INF_PROCESSING",
                    "reason": "Scoring input data...",
                    "message": "Scoring input data...",
                    "percentage": 0.5,
                    "eta": 80
                }
                send_execution_status(taskId, MQInfo, status)

            # text scroring
            text_file = None
            df = None
            try:
                text_file = glob.glob(os.path.join(inputDataPath, '*.csv'))[0]
                text_file = text_file[text_file.rfind(os.sep) + 1:]
            except:
                text_file = None

            if text_file:
                # filtering should be done at this point
                if trainingDataPath == '-':
                    df = score_text_classifier(outputDataPath, inputDataPath, text_file)
                else:
                    df = score_text_classifier(trainingDataPath, inputDataPath, text_file)
                df = df.reset_index()

                print('Text scoring completed...')
                if sendMQMessages:
                    status = {
                        "operation": "INF_PROCESSING",
                        "reason": "Input text scoring complete...",
                        "message": "Input text scoring complete...",
                        "percentage": 0.75,
                        "eta": 60
                    }
                    send_execution_status(taskId, MQInfo, status)

            # image scoring
            image_path = os.path.join(inputDataPath, 'Images')
            if len(glob.glob(os.path.join(inputDataPath, '*'))):
                n_classes = 1
            
                if df.empty:
                    df = pd.read_csv(os.path.join(inputDataPath, text_file))

                if trainingDataPath == '-':
                    df = score(df, outputDataPath, image_path, image_size, n_classes)
                else:
                    df = score(df, trainingDataPath, image_path, image_size, n_classes)

                print('Scoring Completed')
                if sendMQMessages:
                    status = {
                        "operation": "INF_PROCESSING",
                        "reason": "Input image scoring complete...",
                        "message": "Input image scoring complete...",
                        "percentage": 0.95,
                        "eta": 30
                    }
                    send_execution_status(taskId, MQInfo, status)

            print('Writing output')
            if sendMQMessages:
                status = {
                    "operation": "INF_PROCESSING",
                    "reason": "Writing output...",
                    "message": "Writing output...",
                    "percentage": 0.99,
                    "eta": 0
                }
                send_execution_status(taskId, MQInfo, status)

            # retrieve model information
            tPath = ''
            modelQueryString = 'SELECT name, icon, severity FROM models WHERE trainingDataPath="'
            if trainingDataPath == '-':
                tPath = outputDataPath
            else:
                tPath = trainingDataPath
            
            modelQueryString = modelQueryString + tPath + '";'

            modelSelect = text(modelQueryString)
            modelResult = engine.execute(modelSelect)

            modelName = None
            modelIcon = None
            modelSev = None

            for row in modelResult:
                modelName = row['name']
                modelIcon = row['icon']
                modelSev  = (row['severity'] + 1)

            # output
            if trainingDataPath == '-':
                opFile = os.path.join(inputDataPath, 'detected-events.out')
            else:
                opFile = os.path.join(outputDataPath, 'detected-events.out')
            df_sorted = df.sort_values(by=['PREDICTED_TOPIC','PROBABILITY','PREDICTED_IMAGE_CLASS','PROBABILITY_IMAGE'],
                                        ascending=[False,False,False,False])
            print(df_sorted)

            # anything above 0.8 prob gets included
            df_score = df_sorted.loc[((df_sorted['PREDICTED_TOPIC'] == modelName.lower()) & 
                                        (df_sorted['PROBABILITY'] >= 0.8)) |
                                    ((df_sorted['PREDICTED_IMAGE_CLASS'] == modelName.lower()) &
                                    (df_sorted['PROBABILITY_IMAGE'] >= 0.9))]
            print(df_score) 
            # insert to events DB
            conn = engine.connect()

            # event & item insert setup
            eventInsertString = 'INSERT INTO events (name, latitude, longitude, severity, icon) VALUES('
            insertStringEnd = ')'
            itemInsertString = 'INSERT INTO items (short_text, image_path, item_time, latitude, longitude, score, event) VALUES('

            # iterate over the df
            for index, row in df_score.iterrows():
                if pd.notna(row['LAT']) and pd.notna(row['LONG']):
                    eventValues = '"'+modelName+'",'
                    eventValues += str(row['LAT'])+','
                    eventValues += str(row['LONG'])+','
                    eventValues += str(modelSev)+','
                    eventValues += str(modelIcon)

                    eventInsert = text(eventInsertString + eventValues + insertStringEnd)
                    eventResult = conn.execute(eventInsert)
                    eventPK = eventResult.lastrowid

                    # score
                    score = 0.0
                    if pd.notna(row['PROBABILITY']) and pd.notnull(row['PROBABILITY_IMAGE']):
                        if row['PROBABILITY'] >= 0.8 and row['PROBABILITY_IMAGE'] >= 0.8:
                            score = ( row['PROBABILITY'] + row['PROBABILITY_IMAGE']) / 2
                        elif row['PROBABILITY'] >= 0.8:
                            score = row['PROBABILITY']
                        elif row['PROBABILITY_IMAGE'] >= 0.8:
                            score = row['PROBABILITY_IMAGE']
                    elif pd.notna(row['PROBABILITY']):
                        score = row['PROBABILITY']
                    elif pd.notna(row['PROBABILITY_IMAGE']):
                        score = row['PROBABILITY_IMAGE']
                    print(str(score))

                    # datetime
                    eventDatetime = time.gmtime(0)
                    if pd.notna(row['date']):
                        try:
                            eventDatetime = time.strptime(str(row['date']), '%Y%m%d %H:%M:%S')
                        except:
                            pass
                    
                    # image
                    eventImage = ''
                    if pd.notna(row['IMAGE']):
                        dataUUID = inputDataPath[inputDataPath.rfind('/')+1:]
                        eventImage = os.path.join(dataUUID, "Images", row['IMAGE'])
                        print(eventImage)

                    itemValues = '"'+row['TEXT']+'",'
                    itemValues += '"'+eventImage+'",'
                    itemValues += '"' + time.strftime('%Y%m%d %H:%M:%S', eventDatetime) +'",'
                    itemValues += str(row['LAT'])+','
                    itemValues += str(row['LONG'])+','
                    itemValues += str(score)+','
                    itemValues += str(eventPK)

                    itemInsert = text(itemInsertString + itemValues + insertStringEnd)
                    itemResult = conn.execute(itemInsert)
            
            # cleanup
            conn.close()

            df_score.to_csv(opFile, index=None, header=True)   
        
            print('Event Detection completed')
            if sendMQMessages:
                status = {
                    "operation": "RES_COMPLETED",
                    "reason": "Event detection job complete.",
                    "data": {
                    "output_Folder": opFile
                    }
                }
                send_execution_status(taskId, MQInfo, status)
            
            # update the SSE API
            requests.post('http://localhost:5000/api/v1.0/updates', json={"type": "events"})
    except:
        traceback.print_exc()
        error_reason = 'An exception was thrown'
        error_message = traceback.format_exc()

        if trainingDataPath != '-':
            sql = text('UPDATE models SET status="Created", pid=-1 WHERE trainingDataPath="'+trainingDataPath+'";')
            result = engine.execute(sql)

        if sendMQMessages:
            status = {
                "operation": "RES_FAILED",
                "reason": error_reason,
                "message": error_message
            }
            send_execution_status(taskId, MQInfo, status)