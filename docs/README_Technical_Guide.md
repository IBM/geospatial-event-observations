# IBM Geospatial Event Observations Technical Guide

**This README explains technical aspects of the Geospatial Event Observations application that may be useful for data management and troubleshooting issues: data storage and logging. For information about how to build and deploy the application, see the [README](../README.md). For information on using the Geospatial Event Observations application, see the [User Guide](README_User_Guide.md).**

## Table of Contents

* [Data Storage](#data-storage)
* [Logging](#logging)


## Data Storage

The Geospatial Event Observations application requires a docker volume to be specified when running the docker container:

`docker run -d -p <EXT_PORT>:5000 -v <EXT_TARGET_DIR>:/event-data:rw <IMAGE_NAME>:<TAG>`

The `-v` parameter specifies that a Filesystem location on the host is mapped to a directory called `/event-data` in the Geospatial Event Observations docker container. The data uploaded to the application for building Event Models and Datasources is stored in this docker volume. Training Data or Input Data zip archive files are extracted to directories at this location. The directories are named using UUIDs and are tracked in the SQLite Database used by the applciation. There are no automatic data management or data archiving mechanisms in the application - it is expected application owners will monitor and manage this data manually using the functions built into the application (see the [User Guide](README_User_Guide.md) for more details).

## Logging

The Geospatial Event Observations application prints general trace information and exceptions to the standard output of the Flask web server process. This information can be enhanced by turning Diagnostics on in the Application Settings (see the [User Guide](README_User_Guide.md) for more details). Run the following command to view this information while the docker container is running:

`docker logs <CONTAINER_ID>`

Replace the following:
* **<CONTAINER_ID>**: the docker container id for the Geospatial Event Observations application

In addition to general trace information, the Geospatial Event Observations application also creates log files for the actions of creating/updating Event Models (training process) and applying Event Models to Datasources (scoring process). These logs are written as `.log` files to the docker volume specified in the command to run the application (see [Data Storage](#data-storage) above).