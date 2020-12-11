#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from os import environ

baseDir = '/event-data/'

if environ.get('IBM_GED_MUI'):
    baseDir = '/ASGARD_DATA/'
elif environ.get('IIX_GEO_BASE'):
    baseDir = environ.get('IIX_GEO_BASE')

diagnostics = False

def get_diagnostics():
    global diagnostics
    return diagnostics

def set_diagnostics(diag):
    global diagnostics
    diagnostics = diag