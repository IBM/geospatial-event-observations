#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from flask import send_from_directory
# custom modules
from __init__ import app, pool

@app.route('/map-ui/<path:filename>')
def index(filename):
    return send_from_directory('./static/map-ui', filename)

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000)