#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from concurrent.futures import ThreadPoolExecutor
import time

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in set(['zip'])

def allowed_image_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in set(['png','jpg','bmp','ico'])

def print_trace(message, start):
    end = time.time()
    print('%s %s completed in %f s' %(time.ctime(end), message, end-start), flush=True)

def threaded_execution(fx, params, threadCount):
    with ThreadPoolExecutor(threadCount) as tpe:
        result = tpe.map(fx, params)
    return list(result)
