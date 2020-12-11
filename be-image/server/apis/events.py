#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import jsonify, request
from flask_restplus import fields, Namespace, Resource
import glob
import os
import shutil
from sqlalchemy.sql import select, text
import sys
import time
import traceback
import uuid
from werkzeug.utils import secure_filename
import zipfile

sys.path.append('..')

from config import baseDir, get_diagnostics
from .utils import allowed_file, print_trace
from event_database import engine, events, items, models

api = Namespace('events', description='Event instance management functions.')

EventTemplate = api.model('Event', {
    'id': fields.Integer(required=True, description='A unique id that refers to the Event instance', example=1),
    'name': fields.String(required=True, description='A name that refers to the Event instance', example='Fire'),
    'latitude': fields.Float(required=True, description='The latitude GPS coordinate for the event', example=40.8073),
    'longitude': fields.Float(required=True, description='The longitude GPS coordinate for the event', example=-73.9625),
    'severity': fields.Integer(required=True, description='Indicates the seriousness of the event', example=1),
    'active': fields.Boolean(required=True, description='Indicates if the event should be displayed in the map interface', example=True),
    'icon': fields.Integer(required=True, description='The id of an entry in the icons table.', example=1)
})

@api.route('/events', methods=['GET','POST','PUT','DELETE'])
class Events(Resource):
    def sort_event_items(self, item):
        return item['score']

    @api.doc(description="Retrieve specified events.")
    def get(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Events API GET'

        conn = None
        try:
            conn = engine.connect()
            eventsSelect = select([events])
            eventResult = conn.execute(eventsSelect)
            eventsArray = []
            for row in eventResult:
                event = { 
                    'id': row['id'], 
                    'name': row['name'],
                    'latitude': row['latitude'],
                    'longitude': row['longitude'],
                    'severity': row['severity'],
                    'active': row['active'],
                    'iconType': '',
                    'iconClass': '',
                    'items': []
                }

                # get associated items
                itemSelect = text("SELECT id,short_text,image_path,item_time,latitude,longitude,score \
                                        FROM items \
                                        WHERE event="+str(row['id'])+" \
                                        ORDER BY score DESC")
                itemResult = conn.execute(itemSelect)
                for itemRow in itemResult:
                    itemDatetime = time.strptime(itemRow['item_time'], '%Y%m%d %H:%M:%S')
                    item = {
                        'id': itemRow['id'],
                        'short_text': itemRow['short_text'],
                        'image_path': itemRow['image_path'],
                        'time': time.strftime('%Y-%m-%dT%H:%M:%S', itemDatetime),
                        'latitude': itemRow['latitude'],
                        'longitude': itemRow['longitude'],
                        'score': itemRow['score']
                    }

                    # add the item to the event
                    event['items'].append(item)
                
                # get icon info
                iconSelect = text("SELECT type,location FROM icons WHERE id="+str(row['icon']))
                iconResult = conn.execute(iconSelect)
                for iconRow in iconResult:
                    event['iconType'] = iconRow['type']
                    event['iconClass'] = iconRow['location']

                eventsArray.append(event)
            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'event': 'GetEvent', 'error_message': '', 'result': eventsArray})
        except:
            traceback.print_exc()
            if conn != None: conn.close()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'event': None, 'error_message': 'There was a problem retrieving event information.', 'result': 'Failure'})

    @api.expect(EventTemplate)
    @api.doc(description="Update an event instance.")
    def post(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Events API POST'
        
        conn = None
        try:
            id = request.json['id']
            name = request.json['name']
            latitude = request.json['latitude']
            longitude = request.json['longitude']
            severity = request.json['severity']
            active = request.json['active']
            icon = request.json['icon']
            requestItems = request.json['items']

            # sort items by score
            requestItems.sort(key=self.sort_event_items, reverse=True)

            conn = engine.connect()
            eventsUpdate = events.update().values(
                            name=name,  
                            latitude=latitude,
                            longitude=longitude,
                            severity=severity,
                            active=active,
                            icon=icon
                            ).\
                            where(events.c.id == id)
            conn.execute(eventsUpdate)

            if len(requestItems):
                # delete existing
                itemDelete = text("DELETE FROM items WHERE event="+str(id))
                itemDeleteResult = conn.execute(itemDelete)
                if get_diagnostics():
                    print('%d Items deleted for Event ID: %d' %(itemDeleteResult.rowcount, id), flush=True)
                
                for item in requestItems:
                    itemInsert = items.insert().values(short_text=item['short_text'],
                            image_path=item['image_path'],
                            item_time=item['item_time'],
                            latitude=item['latitude'],
                            longitude=item['longitude'],
                            score=item['score'])
                    conn.execute(itemInsert)
                
                if get_diagnostics():
                    print('%d Items inserted for Event ID: %d' %(len(requestItems), id), flush=True)
            
            conn.close()

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'event': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if conn != None: conn.close()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'model': None, 'error_message': 'There was a problem updating the specified event instance.', 'result': 'Failure'})

    @api.expect(EventTemplate)
    @api.doc(description="Create an event instance.")
    def put(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Events API PUT'
        
        conn = None
        try:
            name = request.json['name']
            latitude = request.json['latitude']
            longitude = request.json['longitude']
            severity = request.json['severity']
            active = request.json['active']
            icon = request.json['icon']
            requestItems = request.json['items']

            # sort items by score
            requestItems.sort(key=self.sort_event_items, reverse=True)

            if latitude == 0.0 and len(requestItems):
                latitude = requestItems[0]['latitude']
            else:
                raise Exception('Invalid GPS latitude coordinate')
            
            if longitude == 0.0 and len(requestItems):
                longitude = requestItems[0]['longitude']
            else:
                raise Exception('Invalid GPS longitude coordinate')

            conn = engine.connect()
            # create the event record
            eventInsert = events.insert().values(name=name,
                    latitude=latitude, 
                    longitude=longitude,
                    severity=severity,
                    active=active,
                    icon=icon)
            eventResult = conn.execute(eventInsert)

            if eventResult.rowcount:
                for item in requestItems:
                    itemInsert = items.insert().values(short_text=item['short_text'],
                            image_path=item['image_path'],
                            item_time=item['item_time'],
                            latitude=item['latitude'],
                            longitude=item['longitude'],
                            score=item['score'])
                    conn.execute(itemInsert)

            conn.close()

            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'event': name, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if conn != None: conn.close()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'event': None, 'error_message': 'There was a problem creating the specified event.', 'result': 'Failure'})

    @api.expect(EventTemplate)
    @api.doc(description="Delete an event instance.")
    def delete(self):
        if get_diagnostics():
            start = time.time()
            func_desc = 'Events API DELETE'

        conn = None
        try:
            id = request.json['id']

            conn = engine.connect()
            # delete the items asscoiated with the event
            itemDelete = text("DELETE FROM items WHERE event="+str(id))
            itemResult = conn.execute(itemDelete)
            if get_diagnostics(): 
                print('%d Event Items deleted for Event ID: %d' %(itemResult.rowcount, id), flush=True)

            eventDelete = text("DELETE FROM events WHERE id="+str(id))
            eventResult = conn.execute(eventDelete)
            if get_diagnostics():
                print('Event ID %d deleted, rowcount[%d]' %(id, eventResult.rowcount), flush=True)

            conn.close()
            
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'event': id, 'error_message': '', 'result': 'Success'})
        except:
            traceback.print_exc()
            if conn != None: conn.close()
            if get_diagnostics():
                print_trace(func_desc, start)

            return jsonify({'event': None, 'error_message': 'There was a problem deleting the specified event.', 'result': 'Failure'})
 