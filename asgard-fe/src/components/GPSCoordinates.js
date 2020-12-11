/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class GPSCoordinates extends Component {
    
    close() {
        this.props.callbackFromApp('disposed');
        //this.setState({"dispose":"card asgard-card disposed"});
    }

    render() {
        return (
            <div id="gpsLocation" className={this.props.displayClass}>
                <div className="card-header asgard-header">
                    <div className="asgard-card-header-item" title="Latitude, Longitude, Zoom">{this.props.gpsLocation}</div>
                    <div className="ml-auto asgard-card-header-item asgard-control-padding">
                        <div>
                            <a onClick={this.save.bind(this)} title="Save">
                                <i className="fas fa-save fa-sm asgard-control"></i>
                            </a>
                        </div>
                        <div className="pl-1">
                            <a onClick={this.close.bind(this)} title="Close">
                                <i className="fas fa-times fa-sm asgard-control"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    save() {
        this.props.callbackFromApp('save');
    }

    static getDerivedStateFromError(error) {
        console.log('GPSCoordinates.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default GPSCoordinates;