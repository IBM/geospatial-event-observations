#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#

FROM tiangolo/uwsgi-nginx-flask:python3.6

ENV LISTEN_PORT 5000
EXPOSE 5000

COPY ./requirements.txt /tmp/requirements.txt
RUN pip install -U pip
RUN pip install -r /tmp/requirements.txt

RUN python -m nltk.downloader stopwords
RUN python -m nltk.downloader punkt

RUN PYTHONPATH=.:/app:/root/nltk_data:$PYTHONPATH
RUN export PYTHONPATH

COPY ./server /app
COPY ./server/static/favicon-16x16.png /usr/local/lib/python3.6/site-packages/flask_restplus/static/favicon-16x16.png
COPY ./server/static/favicon-32x32.png /usr/local/lib/python3.6/site-packages/flask_restplus/static/favicon-32x32.png
