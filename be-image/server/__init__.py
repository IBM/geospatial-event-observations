#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import Flask
from flask_cors import CORS
from flask_restplus import Api
from concurrent.futures import ThreadPoolExecutor as Pool
import json
from sqlalchemy import text
from sqlalchemy.sql import select
import traceback

import config
from event_database import engine, icons, locations, Session, settings
from apis import api


app = Flask(__name__, static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///event-detection.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SWAGGER_UI_DOC_EXPANSION'] = 'list'
pool = Pool(max_workers=2000)
api.init_app(app)

CORS(app) # enable CORS support

# perform necessary bootstrap operations
with app.app_context():
    try:
        print('DB Initialising...')
        # check if locations are loaded
        conn = engine.connect()
        session = Session()
        settingsSelect = select([settings])
        currentSettings = conn.execute(settingsSelect).fetchone()
        if currentSettings is None:
            # there are no settings, load the locations and insert settings
            print('No Settings')
            cities = []
            with open('static/cities.json') as f:
                cities = json.load(f)
            
            for city in cities:
                locationInsert = locations.insert().values(name=city['city'],
                                        latitude=city['latitude'],
                                        longitude=city['longitude'],
                                        zoom=city['zoom'])
                conn.execute(locationInsert)

            fileIcons = []
            with open('static/icons.json') as f:
                fileIcons = json.load(f)
            
            for icon in fileIcons:
                iconInsert = icons.insert().values(type=icon['type'], examples=icon['examples'], location=icon['location'])
                conn.execute(iconInsert)
            
            # insert settings
            settingsInsert = settings.insert().values(locations_loaded=True, icons_loaded=True)
            conn.execute(settingsInsert)
        
        if currentSettings != None and not currentSettings.locations_loaded:
            print('Locations loaded setting is false')
            # delete the contents of locations
            # conn.execute(locations.query().delete())
            locDeleteSql = text("DELETE FROM locations")
            conn.execute(locDeleteSql)

            cities = []
            with open('static/cities.json') as f:
                cities = json.load(f)
            
            for city in cities:
                locationInsert = locations.insert().values(name=city['city'],
                                        latitude=city['latitude'],
                                        longitude=city['longitude'],
                                        zoom=city['zoom'])
                conn.execute(locationInsert)
            
            # update settings
            settingsUpdate = settings.update().where(settings.c.id == 1).values(locations_loaded=True)
            conn.execute(settingsUpdate)
        
        if currentSettings != None and not currentSettings.icons_loaded:
            print('Icons loaded setting is false')
            # delete the contents of locations
            # conn.execute(session.query(icons).delete())
            iconDeleteSql = text("DELETE FROM icons")
            conn.execute(iconDeleteSql)

            iconsJSON = []
            with open('static/icons.json') as f:
                iconsJSON = json.load(f)
            
            for icon in iconsJSON:
                iconInsert = icons.insert().values(type=icon['type'], examples=icon['examples'], location=icon['location'])
                conn.execute(iconInsert)
            
            # update settings
            settingsUpdate = settings.update().where(settings.c.id == 1).values(icons_loaded=True)
            conn.execute(settingsUpdate)
        
        if currentSettings != None and currentSettings.diagnostics != config.get_diagnostics():
            print('Diagnostics setting updating')
            config.set_diagnostics(currentSettings.diagnostics)

        conn.close()
        session.close()
        print('DB Initialised!')
    except:
        traceback.print_exc()
        print('There was a problem bootstrapping the database')