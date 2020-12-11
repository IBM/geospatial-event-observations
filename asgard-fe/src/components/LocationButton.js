/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class LocationButton extends Component {
    constructor(props) {
        super(props);

        this.click = this.click.bind(this);
    }

    click() {
        this.props.openLocationMenu();
    }

    render() {
        return (
            <div id="locationButton" className={this.props.displayClass}>
                <button className="btn btn-dark asgard-button" onClick={this.click.bind(this)}>
                    {this.props.selectedLocation.city}
                </button>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('GPSCoordinates.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default LocationButton;