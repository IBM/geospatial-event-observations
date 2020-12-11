#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
import os
pp=os.path.dirname(os.path.abspath(__file__))
import sys
sys.path.insert(0, pp)
from short_text_classifier import score_text_classifier
from image_classifier import score
import pandas as pd
import glob
from geopy import distance
import numpy as np
import traceback

def label_events(dataPath, text_file, modelPath):
    df = score_text_classifier(modelPath, dataPath, text_file)
    df = df.reset_index()
    
    image_size = (56, 56)
    image_path = os.path.join(dataPath, 'Images')
    n_classes = len(glob.glob(os.path.join(image_path, '*')))
    df = score(df, modelPath, image_path, image_size, n_classes)
    
    df = df.set_index(pd.DatetimeIndex(df.date))
    
    return df


def get_event(dataPath, text_file, modelPath, start_time, end_time, keyword, loc, prb=0, area=1):
    try:
        dfs = label_events(dataPath, text_file, modelPath)
        dfs = dfs[start_time : end_time]
        R = np.sqrt((area/np.pi))
        ser = dfs.apply(lambda s : distance.distance(loc, (s.loc['LAT'], s.loc['LONG'])).km, axis=1)
        dfs['DISTANCE'] = ser
        dfs = dfs[dfs.DISTANCE < R]
        all_posts = len(dfs) * 1.0
        dfs = dfs[((dfs.PREDICTED_TOPIC == keyword) & (dfs.PREDICTED_IMAGE_CLASS == keyword))]
        dfs = dfs[dfs.PROBABILITY > prb]
        dfs = dfs[dfs.PROBABILITY_IMAGE > prb]
        Ratio = len(dfs)/all_posts
        return dfs, Ratio
    except:
        traceback.print_exc()
        return None, None



#filename='fake_real_time.csv'
#start_time= '2012-05-18 23:35:50'
#end_time= '2012-07-18 23:59:00'
#loc=( 40.758896,   -73.985130   )
#text='CRIME'
#image='others'
#dfr, rp=get_event(filename, start_time, end_time,text,image,loc)
#print(dfr)
#print(rp*100)