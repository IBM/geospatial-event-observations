#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
import pandas as pd
import os as os
import datetime as dt
import numpy as np
from nltk import word_tokenize


def add_image_class(x):
    cl = 'others'
    tks= word_tokenize(x)
    cls=os.listdir(os.path.join('Images', 'valid'))
    for w in tks:
        for c in cls:
            if w == c: cl = c
    return cl


def add_image_name(y):
    imgs= os.listdir(os.path.join('Images', 'valid',y))
    img=imgs[int(np.random.randint(0,len(imgs)))]
    return img



df = pd.read_json('News_Category_Dataset_v2.json',lines=True)
args=['ARTS' , 'BUSINESS', 'CRIME' , 'EDUCATION', 'ENTERTAINMENT', 'ENVIRONMENT', 'FOOD & DRINK', 'HEALTHY LIVING',
'POLITICS' , 'RELIGION', 'SCIENCE', 'SPORTS', 'TECH', 'TRAVEL']
df=df[df.category.isin(args)]








trn_text = df.groupby('category').apply(lambda gr: gr.sample(frac=0.5))
del trn_text['category']
trn_text = trn_text.reset_index()
cats = np.unique(trn_text.category)
d = dict(zip(cats, range(1,len(cats)+1)))
print(d)
val_text = df.loc[[i for i in df.index if i not in trn_text.level_1]]
val_text.date=val_text.apply(lambda t : t.loc['date'] +  dt.timedelta(0,1200*np.random.normal(d[t.loc['category'] ],5)),axis=1)
lat=40.758896
long=-73.985130
val_text['lat']=val_text.apply(lambda t :  lat + 0.001*np.random.normal(d[t.loc['category'] ],1),axis=1)
val_text['long']=val_text.apply(lambda t : long + 0.001*np.random.normal(d[t.loc['category'] ],1),axis=1)
val_text=val_text.set_index(val_text['date'])
del val_text['date']
print(val_text.info())
val_text['image_class']=val_text.headline.str.lower().apply(lambda x : add_image_class(x))
val_text['image']=val_text.image_class.apply(lambda x : add_image_name(x))

trn=trn_text[['headline','category']]
trn.columns=['TEXT','TOPIC']
trn.to_csv('Training_short_text.csv')


val_text = val_text.sort_index()
tst_text=val_text.tail(1000)
val_text=val_text.head(len(val_text)-1000)
val_text.columns=[i.upper() for i in val_text.columns]
print(val_text.columns)

val_text.columns=['AUTHORS', 'TOPIC', 'TEXT', 'LINK', 'SHORT_DESCRIPTION', 'LAT',  'LONG', 'IMAGE_CLASS', 'IMAGE']
val_text=val_text[[ 'AUTHORS', 'TOPIC', 'TEXT',  'LAT','LONG', 'IMAGE_CLASS', 'IMAGE']  ]

tst_text.columns=['AUTHORS', 'TOPIC', 'TEXT', 'LINK', 'SHORT_DESCRIPTION', 'LAT', 'LONG', 'IMAGE_CLASS', 'IMAGE']
tst_text = tst_text [[ 'AUTHORS', 'TOPIC', 'TEXT',  'LAT','LONG', 'IMAGE_CLASS', 'IMAGE']  ]
val_text.to_csv('fake_real_time.csv')
tst_text.to_csv('text_fake_real_time.csv')