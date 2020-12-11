#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
import json
from watson_developer_cloud import NaturalLanguageClassifierV1
import pandas as pd

#trining
keyapp=''
Url=''
natural_language_classifier = NaturalLanguageClassifierV1(
    iam_apikey=keyapp,
    url= Url)

filename='Training_short_text.csv'
df=pd.read_csv(filename)
training_data= df[['TEXT','TOPIC']].tolist()
#with open(filename, 'rb') as training_data:
with open('./metadata.json', 'rb') as metadata:
    classifier = natural_language_classifier.create_classifier(
            training_data=training_data,
            metadata=metadata
        ).get_result()
print(json.dumps(classifier, indent=2))
#check statuys
status = natural_language_classifier.get_classifier('TextClassifier').get_result()
print (json.dumps(status, indent=2))
classes = natural_language_classifier.classify( 'TextClassifier' , 'How hot will it be today?').get_result()
print(json.dumps(classes, indent=2))
