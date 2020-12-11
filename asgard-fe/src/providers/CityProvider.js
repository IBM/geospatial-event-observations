/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

const CityContext = React.createContext('city');

class CityProvider extends Component {
    state = {
        selectedCity: this.props.defaultLocation,
        changeCity: city => {
            this.setState({
                selectedCity: city,
            });
        },
        setViewportUpdated: () => {
            this.setState({
                updateViewport: false,
            });
        },
        gpsCallback: this.props.gpsCallback,
        eventDetailsCallback: this.props.eventDetailsCallback,
        events: this.props.events,
        updateViewport: false,
        mapboxToken: this.props.mapboxToken,
    };

    componentDidUpdate(prevProps) {
        if (this.state.selectedCity.city !== this.props.defaultLocation.city) {
            this.setState({
                selectedCity: this.props.defaultLocation,
                updateViewport: true,
            });
        }

        if (prevProps.events !== this.props.events) {
            this.setState({
                events: this.props.events,
            });
        }

        if (prevProps.mapboxToken !== this.props.mapboxToken) {
            this.setState({
                mapboxToken: this.props.mapboxToken,
            });
        }
    }

    render() {
        return <CityContext.Provider value={this.state}>{this.props.children}</CityContext.Provider>;
    }
}

export { CityContext, CityProvider };
