#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask_restplus import Api, Namespace

from .train import api as Train
from .validate import api as Validate
from .events import api as Events

api = Api(version='1.0', title='Text Classification', prefix='text_classifier', description='Classification service \
that provides geospatial event detection and classification based on realtime text.')

api.namespaces.clear()
api.add_namespace(Train, path='/api/v1.0')
api.add_namespace(Validate, path='/api/v1.0')
api.add_namespace(Events, path='/api/v1.0')