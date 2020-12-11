#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from sqlalchemy import text, Boolean, Column, create_engine, DateTime, Float, ForeignKey, Integer, MetaData, Sequence, String, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os

from config import baseDir

db_path = os.path.join(baseDir, 'event-detection.db')
Base = declarative_base()
engine = create_engine('sqlite:///'+db_path, poolclass=QueuePool, connect_args={'check_same_thread': False})
Session = sessionmaker(bind=engine)
metadata = MetaData()

#sql = text('DROP TABLE IF EXISTS settings;')
#result = engine.execute(sql)

settings = Table('settings', metadata,
    Column('id', Integer, Sequence('settings_id_seq'), primary_key=True),
    Column('locations_loaded', Boolean, default=False),
    Column('icons_loaded', Boolean, default=False),
    Column('diagnostics', Boolean, default=False),
    Column('default_location', Integer, default=-1),
    Column('map_key', String(120), default='', nullable=False)
)

#sql = text('DROP TABLE IF EXISTS locations;')
#result = engine.execute(sql)

locations = Table('locations', metadata,
    Column('id', Integer, Sequence('locations_id_seq'), primary_key=True),
    Column('name', String(80), unique=True, nullable=False),
    Column('latitude', Integer, nullable=False),
    Column('longitude', Integer, nullable=False),
    Column('zoom', Integer, nullable=False)
)

#sql = text('DROP TABLE IF EXISTS icons;')
#result = engine.execute(sql)

#sql = text('DELETE FROM icons where examples="asgard";')
#result = engine.execute(sql)

icons = Table('icons', metadata,
    Column('id', Integer, Sequence('icons_id_seq'), primary_key=True),
    Column('type', String(80), unique=False, nullable=False),
    Column('examples', String(120), nullable=False),
    Column('location', String(80), nullable=False)
)

#sql = text('DROP TABLE IF EXISTS models;')
#result = engine.execute(sql)

models = Table('models', metadata,
    Column('id', Integer, Sequence('models_id_seq'), primary_key=True),
    Column('name', String(80), unique=True, nullable=False),
    Column('trainingDataPath', String(120), nullable=False),
    Column('icon', Integer, ForeignKey('icons.id')),
    Column('severity', Integer, default=4),
    Column('status', String(80), nullable=False, default="Created"),
    Column('pid', Integer, default=-1)
)

#sql = text('DROP TABLE IF EXISTS datasources;')
#result = engine.execute(sql)

datasources = Table('datasources', metadata,
    Column('id', Integer, Sequence('datasources_id_seq'), primary_key=True),
    Column('name', String(80), nullable=False),
    Column('uuid', String(120), unique=True, nullable=False),
    Column('type', String(80), nullable=False),
    Column('json_definition', String(4096), nullable=False)
)

#sql = text('DROP TABLE IF EXISTS events;')
#result = engine.execute(sql)

#sql = text('DELETE FROM events;')
#result = engine.execute(sql)

events = Table('events', metadata,
    Column('id', Integer, Sequence('events_id_seq'), primary_key=True),
    Column('name', String(80), nullable=False),
    Column('latitude', Float, nullable=False),
    Column('longitude', Float, nullable=False),
    Column('severity', Integer, nullable=False),
    Column('active', Boolean, default=True),
    Column('icon', Integer, ForeignKey('icons.id'))
)

#sql = text('DROP TABLE IF EXISTS items;')
#result = engine.execute(sql)

#sql = text('DELETE FROM items;')
#result = engine.execute(sql)

items = Table('items', metadata,
    Column('id', Integer, Sequence('items_id_seq'), primary_key=True),
    Column('short_text', String(4096), nullable=True),
    Column('image_path', String(240), nullable=True),
    Column('item_time', DateTime(), nullable=False),
    Column('latitude', Float, nullable=False),
    Column('longitude', Float, nullable=False),
    Column('score', Float, nullable=False),
    Column('event', Integer, ForeignKey('events.id'))
)

metadata.create_all(engine)