/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';

class Locations extends Component {
    state = {
        cities: [],
        addingLocation: false,
        addingInProgress: false,
        addLocationButtonClass: 'btn btn-dark asgard-button',
        addLocationIconClass: 'fas fa-save',
        editLocationClass: 'disposed d-inline-flex px-2',
        editLocationSelected: -1,
        editingLocation: false,
        editInProgress: false,
        editLocationButtonClass: 'btn btn-dark asgard-button',
        editLocationIconClass: 'fas fa-save',
        removeInProgress: false,
        removeLocationButtonClass: 'btn btn-dark asgard-button',
        removeLocationIconClass: 'fas fa-trash-alt',
    };

    componentDidMount() {
        this.updateLocationsList();
    }

    componentDidUpdate() {
        if(this.props.addGPSLocation && this.props.addGPSLocation !== '') {
            this.setAddFields();
        }
    }

    updateLocationsList() {
        this.getCities()
            .then(res => {
                this.updateCities(res.result);
            })
            .catch(err => console.log(err));
    }

    getCities = async () => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/locations');
        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    add() {
        if (!this.state.addingInProgress) {
            // check the Location name - non-blank, not already used
            let name = document.getElementById('locationName').value;
            let lat = document.getElementById('latValue').value;
            let long = document.getElementById('longValue').value;
            let zoom = document.getElementById('zoomValue').value;
            
            if (this.validString(name) && this.validString(lat) && this.validString(long) && this.validString(zoom)) {
                // update the add button to indicate progress
                this.setState({
                    'addingInProgress': true,
                    'addLocationButtonClass': 'btn btn-dark asgard-button disabled',
                    'addLocationIconClass': 'fas fa-sync-alt fa-spin',
                });  
                this.addCity(name, lat, long, zoom)
                    .then( res => {
                        // check for success
                        if (res.result === 'Success') {
                            // clear the create fields
                            document.getElementById('locationName').value = '';
                            document.getElementById('latValue').value = '';
                            document.getElementById('longValue').value = '';
                            document.getElementById('zoomValue').value = '';

                            // refresh the cities list
                            this.updateLocationsList();

                            // callback to update the locations held by app.js
                            this.props.callbackFromApp('update');
                        } else {
                            console.log('There was a problem adding the new location: ' + res.error_message);
                        }
                        this.setState({
                            'addingLocation': false,
                            'addingInProgress': false,
                            'addLocationButtonClass': 'btn btn-dark asgard-button',
                            'addLocationIconClass': 'fas fa-save',
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        this.setState({
                            'addingInProgress': false,
                            'addLocationButtonClass': 'btn btn-dark asgard-button',
                            'addLocationIconClass': 'fas fa-save',
                        });
                    });
            }
        } else {
            console.log('A new location is currently being added. Please try again later!');
        }
    }

    addCity = async(name, lat, long, zoom) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/locations', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'id': 0, 'city': name, 'latitude': lat, 'longitude': long, 'zoom': zoom}),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }
    
    open() {
        
    }

    close() {
        this.props.callbackFromApp();
    }

    cityCompare(a,b) {
        let cityA = a.city.toUpperCase();
        let cityB = b.city.toUpperCase();
        if (cityA > cityB) {
            return 1;
        }
        if (cityA < cityB) {
            return -1;
        }
        return 0;
    }

    citySelect(event) {
        // clear any previously selected
        let selectedElements = document.getElementsByClassName('asgard-list-group-item-selected');
        [].forEach.call(selectedElements, function(selectedElement) {
            selectedElement.className = selectedElement.className.replace(/\basgard-list-group-item-selected\b/g, "");
        });

        let locationId = parseInt((event.target.id).substring(9), 10);

        // retrieve the city object
        let targetLocation = this.state.cities.find(x => x.id === locationId);
        
        //set the item as selected
        this.setState({
            editLocationSelected: locationId,
        });
        event.target.className = event.target.className + " asgard-list-group-item-selected";

        // set the location name
        document.getElementById('editLocationName').value = targetLocation.city;
        // set the latitude
        document.getElementById('editLatValue').value = targetLocation.latitude;
        // set the longitude
        document.getElementById('editLongValue').value = targetLocation.longitude;
        // set the zoom
        document.getElementById('editZoomValue').value = targetLocation.zoom;

        // make the edit fields visible
        this.setState({"editLocationClass": "d-inline-flex px-2"});
        
        // if a city has just been selected it is not being edited yet - disable editing
        if (this.state.editingLocation) {
            this.setState({"editingLocation": false});
            // disable the save button
        }
    }

    remove() {
        if (!this.state.removeInProgress) {
            if (this.state.editLocationSelected !== -1) {
                // update the remove button to indicate progress
                this.setState({
                    'removeInProgress': true,
                    'removeLocationButtonClass': 'btn btn-dark asgard-button disabled',
                    'removeLocationIconClass': 'fas fa-sync-alt fa-spin',
                });

                let target = this.state.cities.find(x => x.id === this.state.editLocationSelected);
                this.removeCity(target.id, target.city, target.latitude, target.longitude, target.zoom)
                    .then( res => {
                        // check for success
                        if (res.result === 'Success') {
                            // clear and hide the edit fields
                            document.getElementById('editLocationName').value = '';
                            document.getElementById('editLatValue').value = '';
                            document.getElementById('editLongValue').value = '';
                            document.getElementById('editZoomValue').value = '';
                            this.setState({
                                'editLocationClass': 'disposed d-inline-flex px-2',
                                'editLocationSelected': -1,
                            });

                            // refresh the cities list
                            this.updateLocationsList();

                            // callback to update the locations held by app.js
                            this.props.callbackFromApp('update');
                        } else {
                            console.log('There was a problem deleting the selected location: ' + res.error_message);
                        }
                        this.setState({
                            'removeInProgress': false,
                            'removeLocationButtonClass': 'btn btn-dark asgard-button',
                            'removeLocationIconClass': 'fas fa-trash-alt',
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        this.setState({
                            'removeInProgress': false,
                            'removeLocationButtonClass': 'btn btn-dark asgard-button',
                            'removeLocationIconClass': 'fas fa-trash-alt',
                        });
                    });
            }
        } else {
            console.log('A location is currently being deleted. Please try again later!');
        }
    }

    removeCity = async(id, name, lat, long, zoom) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/locations', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'id': id, 'city': name, 'latitude': lat, 'longitude': long, 'zoom': zoom}),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    save(event) {
        if (!this.state.editInProgress) {
            console.log('Saving...');
            if (this.state.editLocationSelected !== -1 && this.state.editingLocation) {
                // retrieve the update values
                let name = document.getElementById('editLocationName').value;
                let latitude = document.getElementById('editLatValue').value;
                let longitude = document.getElementById('editLongValue').value;
                let zoom = document.getElementById('editZoomValue').value;

                // update the edit button to indicate progress
                this.setState({
                    'editInProgress': true,
                    'editLocationButtonClass': 'btn btn-dark asgard-button disabled',
                    'editLocationIconClass': 'fas fa-sync-alt fa-spin',
                });

                this.saveCity(this.state.editLocationSelected, name, latitude, longitude, zoom)
                    .then(res => {
                        if (res.result === 'Success') {
                            this.getCities()
                                .then(citiesRes => {
                                    this.updateCities(citiesRes.result);

                                    this.setState({
                                        'editingLocation': false,
                                        'editInProgress': false,
                                        'editLocationButtonClass': 'btn btn-dark asgard-button',
                                        'editLocationIconClass': 'fas fa-save',
                                    });

                                    // callback to update the locations held by app.js
                                    this.props.callbackFromApp('update');
                                })
                                .catch(citiesErr => console.log(citiesErr));
                        } else {
                            console.log('There was a problem updating the selected location:' + res.error_message);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        this.setState({
                            'editInProgress': false,
                            'editLocationButtonClass': 'btn btn-dark asgard-button',
                            'editLocationIconClass': 'fas fa-save',
                        });
                    });
            }
        } else {
            console.log('A location is currently being updated. Please try again later!')
        }
    }

    saveCity = async(id, name, lat, long, zoom) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/locations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'id': id, 'city': name, 'latitude': lat, 'longitude': long, 'zoom': zoom}),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    setAddFields() {
        // split the lat, long string
        let coords = this.props.addGPSLocation.split(',');

        const locationsManager = document.querySelector('#manageLocations');
        
        // set the lat and long fields
        let latField = locationsManager.querySelector('#latValue')
        latField.value = coords[0];
        let longField = locationsManager.querySelector('#longValue') 
        longField.value = coords[1].trim();
        let zoomField = locationsManager.querySelector('#zoomValue');
        zoomField.value = coords[2].trim();

        // callback to indicate we have set the values
        this.props.callbackFromApp('gpsSet');
    }

    updateAddFields = function(event) {
        // retrieve the current values
        let name = document.getElementById('locationName').value;
        let lat = document.getElementById('latValue').value;
        let long = document.getElementById('longValue').value;
        let zoom = document.getElementById('zoomValue').value;

        if (this.validString(name) && this.validString(lat) && this.validString(long) && this.validString(zoom)) {
            if (!this.state.addingLocation) {
                this.setState({"addingLocation": true});
            }
        } else {
            if (this.state.addingLocation) {
                this.setState({"addingLocation": false});
            }
        }
    }

    updateEditFields = function(event) {
        // if any of the edit fields are changed enable the ability to update the location
        // retrieve the currently selected location object
        let targetLocation = this.state.cities.find(x => x.id === this.state.editLocationSelected);

        // retrieve the current values
        let name = document.getElementById('editLocationName').value;
        let lat = document.getElementById('editLatValue').value;
        let long = document.getElementById('editLongValue').value;
        let zoom = document.getElementById('editZoomValue').value;

        if (this.validString(name) && this.validString(lat) && this.validString(long) && this.validString(zoom)) {
            // check if current values are different to DB stored
            if (name !== targetLocation.city || lat !== targetLocation.latitude 
                || long !== targetLocation.longitude || zoom !== targetLocation.zoom) {
                if (!this.state.editingLocation) {
                    this.setState({"editingLocation": true});
                }
            }
        } else {
            if (this.state.editingLocation) {
                this.setState({"editingLocation": false});
            }
        }
    }

    updateCities = function(newCities) {
        var temp = newCities;
        temp.sort(this.cityCompare);
        this.setState({
            cities: temp,
        });
    }

    validString(aString) {
        return aString && aString !== '';
    }

    render() {
        return (
            <div id="manageLocations" className={this.props.displayClass}>
                <div className="card asgard-card">
                    <DialogHeader title="Manage Locations" callback={this.close.bind(this)}/>
                    <div className="card-body asgard-body">
                        <div className="asgard-body-section-header">Add a new location</div>
                        <div>
                            <div className="asgard-multi-column-section">
                                <div>
                                    <div className="d-flex flex-column">
                                        <div className="asgard-field-label">
                                            <label htmlFor="locationName">Name&nbsp;</label>
                                        </div>
                                        <div className="asgard-field-label">
                                            <label htmlFor="latValue">Latitude&nbsp;</label>
                                        </div>
                                        <div className="asgard-field-label">
                                            <label htmlFor="longValue">Longitude&nbsp;</label>
                                        </div>
                                        <div className="asgard-field-label">
                                            <label htmlFor="zoomValue">Zoom&nbsp;</label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="d-flex flex-column">
                                        <div className="asgard-field-label">
                                            <input id="locationName" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                            &nbsp;
                                            <a title="A user-defined, unique name for the location">
                                                <i className="fas fa-question-circle asgard-help"></i>
                                            </a>
                                        </div>
                                        <div className="asgard-field-label">
                                            <input id="latValue" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                            &nbsp;
                                            <a title="GPS Latitude coordinate">
                                                <i className="fas fa-question-circle asgard-help"></i>
                                            </a>
                                        </div>
                                        <div className="asgard-field-label">
                                            <input id="longValue" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                            &nbsp;
                                            <a title="GPS Longitude coordinate">
                                                <i className="fas fa-question-circle asgard-help"></i>
                                            </a>
                                        </div>
                                        <div className="asgard-field-label">
                                            <input id="zoomValue" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                            &nbsp;
                                            <a title="Map Zoom Scale">
                                                <i className="fas fa-question-circle asgard-help"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="align-bottom asgard-multi-column-section">
                                { this.state.addingLocation ? (
                                    <button className={this.state.addLocationButtonClass} title="Add Location" onClick={this.add.bind(this)}>
                                        <i className={this.state.addLocationIconClass}></i>
                                    </button>
                                ) : (
                                    <button className="btn btn-dark asgard-button disabled" title="Add Location">
                                        <i className="fas fa-save"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <hr/>
                        <div className="d-flex">
                            <div className="asgard-multi-column-section">
                                <div className="col-12 scrollable-block asgard-multi-select list-group list-group-flush">
                                    {this.state.cities.map(city => (
                                        <a
                                            key={city.city}
                                            id={"editItem_" + city.id}
                                            className={this.state.editLocationSelected === city.id ? 
                                                "list-group-item py-1 list-group-action asgard-list-group-item asgard-list-group-item-selected"
                                                : 
                                                "list-group-item py-1 list-group-action asgard-list-group-item"
                                            }
                                            onClick={this.citySelect.bind(this)}
                                        >
                                            {city.city}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="asgard-multi-column-section asgard-multi-select-partner">
                                <div className={this.state.editLocationClass}>
                                    <div>
                                        <div className="d-flex flex-column">
                                            <div className="asgard-field-label">
                                                <label htmlFor="editLocationName">Name&nbsp;</label>
                                            </div>
                                            <div className="asgard-field-label">
                                                <label htmlFor="editLatValue">Latitude&nbsp;</label>
                                            </div>
                                            <div className="asgard-field-label">
                                                <label htmlFor="editLongValue">Longitude&nbsp;</label>
                                            </div>
                                            <div className="asgard-field-label">
                                                <label htmlFor="editZoomValue">Zoom&nbsp;</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex flex-column">
                                            <div className="asgard-field-label">
                                                <input id="editLocationName" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                            </div>
                                            <div className="asgard-field-label">
                                                <input id="editLatValue" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                            </div>
                                            <div className="asgard-field-label">
                                                <input id="editLongValue" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                            </div>
                                            <div className="asgard-field-label">
                                                <input id="editZoomValue" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="align-bottom ml-auto mt-auto">
                                    <div>
                                        { this.state.editingLocation ? (
                                            <button className={this.state.editLocationButtonClass} title="Save Update" onClick={this.save.bind(this)}>
                                                <i className={this.state.editLocationIconClass}></i>
                                            </button>
                                        ) : (
                                            <button className="btn btn-dark asgard-button disabled" title="Save Update">
                                                <i className="fas fa-save"></i>
                                            </button>
                                        )}
                                    </div>
                                    <div className="pt-1">
                                        { this.state.editLocationSelected !== -1 ? (
                                            <button className={this.state.removeLocationButtonClass} title="Delete Location" onClick={this.remove.bind(this)}>
                                                <i className={this.state.removeLocationIconClass}></i>
                                            </button> 
                                        ) : (
                                            <button className="btn btn-dark asgard-button disabled" title="Delete Location">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <DialogFooter callback={this.close.bind(this)}/>
                    </div>
                </div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('Location.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default Locations;