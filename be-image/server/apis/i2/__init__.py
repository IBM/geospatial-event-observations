#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask_restplus import Api

from .acquire import api as Acquire
from .configuration import api as Configuration
from .validate import api as Validate

api = Api(version='1.0', title='i2 Connect Interactions', prefix='i2', description='i2 Connect Interactions \
APIs that implement the functionality required for i2 connecters.')

api.namespaces.clear()

api.add_namespace(Acquire, path='/api/v1.0')
api.add_namespace(Configuration, path='/api/v1.0')
api.add_namespace(Validate, path='/api/v1.0')