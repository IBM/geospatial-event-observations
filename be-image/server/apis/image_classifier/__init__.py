#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask_restplus import Api

from .train import api as Train
from .validate import api as Validate


api = Api(version='1.0', title='Image Classification', prefix='image_classifier', description='Classification service \
that provides geospatial event detection and classification based on realtime images.', tags='ImageClassifier')

api.namespaces.clear()
api.add_namespace(Train, path='/api/v1.0')
api.add_namespace(Validate, path='/api/v1.0')