/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

import { getSettings } from '../services/settings';

class LocationSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            locations: props.locations,
            defaultLocation: -1,
            selectedLocation: -1,
            saveSettingsButtonClass: 'btn btn-dark asgard-button',
            saveSettingsClass: 'fas fa-save',
            savingLocation: false,
            saveInProgress: false,
        };

        this.getDefaultLocation = this.getDefaultLocation.bind(this);
        this.locationSelect = this.locationSelect.bind(this);
    }

    componentDidMount() {
        this.getDefaultLocation();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.locations !== prevProps.locations) {
            this.setState({
                locations: this.props.locations,
            });
        }
    }

    locationSelect(event) {
        // clear any previously selected
        const locationManager = document.querySelector('#defaultLocation');
        let selectedElements = locationManager.getElementsByClassName('asgard-list-group-item-selected');
        [].forEach.call(selectedElements, function(selectedElement) {
            selectedElement.className = selectedElement.className.replace(/\basgard-list-group-item-selected\b/g, "");
        });

        let locationId = parseInt((event.target.id).substring(9), 10);

        // retrieve the city object
        let targetLocation = this.state.locations.find(x => x.id === locationId);
        
        //set the item as selected
        this.setState({
            selectedLocation: locationId,
        });
        event.target.className = event.target.className + " asgard-list-group-item-selected";

        if (targetLocation.id !== this.state.defaultLocation) {
            this.setState({"savingLocation": true});
        } else {
            this.setState({'savingLocation': false});
        }
    }

    getDefaultLocation() {
        getSettings()
            .then(res => {
                if (res.error_message === '') {
                    const settings = res.result[0];
                    this.setState({
                        'selectedLocation': settings.default_location,
                        'defaultLocation': settings.default_location,
                    });
                } else {
                    console.log('There was an issue retrieving application settings. ' + res.error_message);
                }
            })
            .catch(err => console.log(err));
    }

    render() {
        return (
            <div id="defaultLocationManager" className="d-flex">
                <div className="asgard-multi-column-section">
                    <div className="col-12 scrollable-block asgard-multi-select list-group list-group-flush">
                        {this.state.locations.map(city => (
                            <a
                                key={city.city}
                                id={"location_" + city.id}
                                className={this.state.selectedLocation === city.id ? 
                                    "list-group-item py-1 list-group-action asgard-list-group-item asgard-list-group-item-selected"
                                    : 
                                    "list-group-item py-1 list-group-action asgard-list-group-item"
                                }
                                onClick={this.locationSelect.bind(this)}
                            >
                                {city.city}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="asgard-multi-column-section align-bottom">
                    <div className="ml-auto mt-auto">
                        { this.state.savingLocation ? (
                            <button className={this.state.saveSettingsButtonClass} title="Save Settings" onClick={this.save.bind(this)}>
                                <i className={this.state.saveSettingsClass}></i>
                            </button>
                        ) : (
                            <button className="btn btn-dark asgard-button disabled" title="Save Settings">
                                <i className="fas fa-save"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    save() {
        if(!this.state.saveInProgress) {
            this.setState({
                'saveInProgress': true,
                'saveSettingsButtonClass': 'btn btn-dark asgard-button disabled',
                'saveSettingsClass': 'fas fa-sync-alt fa-spin',
            });
            
            const newSettings = {
                'id': 1,
                'locations_loaded': true,
                'icons_loaded': true,
                'diagnostics': false,
                'default_location': this.state.selectedLocation,
            };

            this.saveSettings(newSettings)
                .then(res => {
                    if (res.result === 'Success') {
                        this.setState({
                            'defaultLocation': this.state.selectedLocation,
                            'saveInProgress': false,
                            'savingLocation': false,
                            'saveSettingsButtonClass': 'btn btn-dark asgard-button',
                            'saveSettingsClass': 'fas fa-save',
                        });
                    } else {
                        console.log('There was a problem updating the default location:' + res.error_message);
                        this.setState({
                            'saveInProgress': false,
                            'saveSettingsButtonClass': 'btn btn-dark asgard-button',
                            'saveSettingsClass': 'fas fa-save',
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        'saveInProgress': false,
                        'saveSettingsButtonClass': 'btn btn-dark asgard-button',
                        'saveSettingsClass': 'fas fa-save',
                    });
                });
        } else {
            console.log('The default location is currently being saved. Please try again later!');
        }
    }

    saveSettings = async(settings) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;    
    }
}

export default LocationSelector;
   