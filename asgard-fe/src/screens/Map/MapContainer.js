/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import { FlyToInterpolator } from 'react-map-gl';
import MapView from './components/MapView';
import { getLocation } from '../../services/locations';
import { getSettings } from '../../services/settings';

export default class MapContainer extends Component {
    constructor(props) {
        super(props);
        let initialLat = (props.context.selectedCity.latitude !== undefined) ? props.context.selectedCity.latitude : 52.3680;
        let initialLong = (props.context.selectedCity.longitude !== undefined) ? props.context.selectedCity.longitude : 4.9036;
        
        this.state = {
            cities: [],
            showMenu: false,
            currentFilter: '10',
            viewport: {
                latitude: initialLat,
                longitude: initialLong,
                zoom: 11,
                bearing: 0,
                pitch: 0,
                width: 500,
                height: 500,
            },
            currentGPS: "",
            initialMount: true,
            mapPopups: [],
            mapboxToken: props.context.mapboxToken,
        };
    }

    componentDidMount() {
        // retrieve cities from BE
        // let defaultLat = -1;
        // let defaultLong = -1;
        this.getCities()
            .then(res => {
                this.setState({ cities: res.result });
                if (this.state.initialMount) {
                    // get the Default Location
                    getSettings()
                        .then(resSet => {
                            if (resSet.error_message === '') {
                                const defaultLocation = resSet.result[0].default_location;
                                if (defaultLocation !== -1) {
                                    getLocation(defaultLocation)
                                        .then(locRes => {
                                            if (locRes.error_message === '' && locRes.result.length > 0) {
                                                this.setState(prevState => ({
                                                        initialMount: false,
                                                        viewport: {
                                                            ...prevState.viewport,
                                                            latitude: locRes.result[0].latitude,
                                                            longitude: locRes.result[0].longitude,
                                                            zoom: locRes.result[0].zoom,
                                                        },
                                                    })
                                                );
                                                this.props.context.changeCity(locRes.result[0]);
                                            }
                                        })
                                        .catch(locErr => console.log(locErr));
                                }
                            }
                        })
                        .catch(errSet => console.log(errSet));
                }
            })
            .catch(err => console.log(err));
        
        /*this.setState({
            cities: CITIES,
        });*/

        window.addEventListener('resize', this.resize);
        this.resize();
        /*if (this.props.context.selectedCity) {
            this.setState(
                prevState => ({
                    showMenu: false,
                    viewport: {
                        ...prevState.viewport,
                        latitude: this.props.context.selectedCity.latitude,
                        longitude: this.props.context.selectedCity.longitude,
                    },
                }),
                () => this.getEventsForCity(this.props.context.selectedCity.city)
            );
        }*/
    }

    componentDidUpdate() {
        if (this.props.context.updateViewport) {
            this.goToViewport(this.props.context.selectedCity);
            this.props.context.setViewportUpdated();
        }

        if (this.props.context.mapboxToken !== this.state.mapboxToken) {
            this.setState({
                mapboxToken: this.props.context.mapboxToken,
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    getCities = async () => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/locations');
        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    getEventsForCity = city => {
        console.log(`Getting events for ${city}`);
        //   fetch the events for the city the user has picked
        // getRequest('/api/test')
        //   .then(console.log)
        //   .catch(console.log);
    };

    onViewportChange = viewport => {
        this.setState({
            viewport: { ...this.state.viewport, ...viewport },
        });
    };

    resize = () => {
        this.onViewportChange({
            width: this.props.width || window.innerWidth,
            height: this.props.height || window.innerHeight,
        });
    };

    goToViewport = ({ city, longitude, latitude, zoom }) => {
        this.getEventsForCity(city);
        this.onViewportChange({
            longitude,
            latitude,
            zoom,
            transitionInterpolator: new FlyToInterpolator(),
            transitionDuration: 3000,
        });
    };

    handleChosenCity = city => {
        this.setState(
            prevState => ({
            showMenu: !prevState.showMenu,
            }),
            () => {
                this.props.context.changeCity(city);
                this.goToViewport(city);
            }
        );
    };

    toggleMenu = () => {
        console.log("Toggling the menu");
        if (this.props.context.selectedCity) {
            this.setState(prevState => ({
                showMenu: !prevState.showMenu,
            }));
        } else {
            this.handleChosenCity(this.state.cities[0]);
        }
    };

    handleFilterChange = e => {
        this.setState({ currentFilter: e.target.value }, () => {
            // todo: fetch the events from the backend for the last events in last X filter e.g.: get me the events from the last 60 minutes...
        });
    };

    handleContextMenu = e => {
        e.preventDefault();
        this.props.context.gpsCallback(`${this.state.currentGPS}, ${Math.round(this.state.viewport.zoom)}`);
    };

    handleHover = e => {
        // console.log(e);
        this.setState({
            currentGPS: "" + e.lngLat[1].toFixed(4) + ", " + e.lngLat[0].toFixed(4)
        });
    }

    handleMarkerHover = (operation, anEvent) => {
        console.log('MapContainer Marker hover callback...');
        let temp = this.state.mapPopups.slice(0);
        if(operation) {
            temp.push(anEvent);
        } else {
            temp.splice(anEvent, 1);
        }
        this.setState({
            mapPopups: temp,
        });
    }

    handleMarkerClick = (anEvent) => {
        const targetEvent = this.state.mapPopups.find(x => x.id === anEvent.id);
        let temp = this.state.mapPopups.slice(0);
        if(!targetEvent) {
            temp.push(anEvent);
        } else {
            temp.splice(anEvent, 1);
        }
        this.setState({
            mapPopups: temp,
        });
    }

    handlePopupClose = (anEvent) => {
        this.handleMarkerHover(0, anEvent);
    }

    handleShowEventDetails = (anEvent) => {
        this.props.context.eventDetailsCallback(anEvent);
    }

    render() {
        if (this.state.mapboxToken && this.state.mapboxToken !== '') {
            return (
                <MapView
                    viewport={this.state.viewport}
                    mapStyle="mapbox://styles/mapbox/dark-v9"
                    onViewportChange={this.onViewportChange}
                    dragToRotate={false}
                    mapboxApiAccessToken={this.state.mapboxToken}
                    cityDetails={this.props.context}
                    cities={this.state.cities}
                    onCityChange={this.handleChosenCity}
                    showCitySelectionMenu={this.state.showMenu}
                    toggleCitySelectionMenu={this.toggleMenu}
                    currentFilter={this.state.currentFilter}
                    onFilterChange={this.handleFilterChange}
                    onContextMenu={this.handleContextMenu}
                    onHover={this.handleHover}
                    events={this.props.context.events}
                    mapPopups={this.state.mapPopups}
                    onMarkerHover={this.handleMarkerHover}
                    onMarkerClick={this.handleMarkerClick}
                    closeMapPopup={this.handlePopupClose}
                    openEventDetails={this.handleShowEventDetails}
                />
            );
        } else {
            return (
                <div id="noMapboxKey" className="asgard-setting-info d-inline-flex m-auto">
                    <div>Please set a Mapbox API Key in Settings</div>
                    <div className="pl-1">
                        <i className="fas fa-cog fa-lg"></i>
                    </div>
                </div>
            );
        }
    }
}
