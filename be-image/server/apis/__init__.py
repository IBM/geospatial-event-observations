#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask_restplus import Api

from .data import api as Dataset
from .datasources import api as Datasources
from .endpoint import api as Endpoint
from .events import api as Events
from .i2 import api as i2Connect
from .icons import api as Icons
from .image_classifier import api as ImageClassifier
from .images import api as Images
from .locations import api as Locations
from .mapkey import api as Mapkey
from .models import api as Models
from .mui import api as MUI
from .settings import api as Settings
from .text_classifier import api as TextClassifier
from .updates import api as Updates

api = Api(version='1.0', title='ASGARD Geospatial Event Classification', description='Service \
that provides geospatial event detection and classification based on realtime text and image data.')

api.namespaces.clear()

api.add_namespace(Dataset, path='/api/v1.0')
api.add_namespace(Datasources, path='/api/v1.0')
api.add_namespace(Endpoint, path='/api/v1.0')
api.add_namespace(Events, path='/api/v1.0')
api.add_namespace(Icons, path='/api/v1.0')
api.add_namespace(Images, path='/api/v1.0')
api.add_namespace(Locations, path='/api/v1.0')
api.add_namespace(Mapkey, path='/api/v1.0')
api.add_namespace(Models, path='/api/v1.0')
api.add_namespace(MUI, path='/api/v1.0')
api.add_namespace(Settings, path='/api/v1.0')
api.add_namespace(Updates, path='/api/v1.0')

api.add_namespace(ImageClassifier.namespaces[0], path='/api/v1.0')
api.add_namespace(ImageClassifier.namespaces[1], path='/api/v1.0')

api.add_namespace(TextClassifier.namespaces[0], path='/api/v1.0')
api.add_namespace(TextClassifier.namespaces[1], path='/api/v1.0')
api.add_namespace(TextClassifier.namespaces[2], path='/api/v1.0')

api.add_namespace(i2Connect.namespaces[0], path='/api/v1.0')
api.add_namespace(i2Connect.namespaces[1], path='/api/v1.0')
api.add_namespace(i2Connect.namespaces[2], path='/api/v1.0')
