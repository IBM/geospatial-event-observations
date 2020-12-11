/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React from 'react';
import Routes from './router/Routes';
import RealtimeClock from './components/RealtimeClock';
//import CatalogPanel from './components/CatalogPanel';
import Logo from './components/Logo';
import GPSCoordinates from './components/GPSCoordinates';
import SidebarMenu from './components/SidebarMenu';
import LocationButton from './components/LocationButton';
import LocationMenu from './components/LocationMenu';
import Locations from  './components/Locations';
import EventModels from './components/EventModels';
import Events from './components/Events';
import Replayer from './components/Replayer';
import Datasources from './components/Datasources';
import Reports from './components/Reports';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import { CityProvider } from './providers/CityProvider';
import './App.css';
import { getEvents } from './services/events';
import { cityCompare, /*getLocation,*/ getLocations } from './services/locations';
import { getSettings } from './services/settings';
import { remSizeToPix } from './services/utils';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        let initialEvents = [];
        
        this.state = {
            sidebarMenuVisibility: "hidden",
            logoPosition: "",
            locationButtonClass: "asgard-location-button",
            locationMenuClass: "asgard-manager col-6 disposed",
            locationsClass: "asgard-manager col-6 disposed",
            eventModelsClass: "asgard-manager col-6 disposed",
            eventsClass: "asgard-manager col-6 disposed",
            replayerClass: "asgard-manager col-6 disposed",
            datasourcesClass: "asgard-manager col-6 disposed",
            reportsClass: "asgard-manager col-6 disposed",
            alertsClass: "asgard-manager col-6 disposed",
            settingsClass: "asgard-manager col-6 disposed",
            gpsClass: "card asgard-card asgard-gps disposed",
            gpsLocation: "",
            addGPSLocation: "",
            defaultLocation: {
                "city": "Amsterdam",
                "latitude": 52.3680,
                "longitude": 4.9036,
                "zoom": 11
            },
            events: initialEvents,
            //events: [],
            targetEvent: {id: -1},
            locations: [],
            modelsUpdateToggle: false,
            mapboxKey: '',
        };

        this.changeLocation = this.changeLocation.bind(this);
        this.updateLocationsList = this.updateLocationsList.bind(this);
        this.updateMapboxKey = this.updateMapboxKey.bind(this);

        // SSE receptor
        this.eventSource = new EventSource(process.env.REACT_APP_API_ENDPOINT_URI + 'api/v1.0/updates');

        getSettings()
            .then(resSet => {
                if (resSet.error_message === '') {
                    const defaultLocation = resSet.result[0].default_location;
                    const mapboxKey = resSet.result[0].map_key;
                    getLocations()
                        .then(locRes => {
                            if (locRes.error_message === '' && locRes.result.length > 0) {
                                let targetLocation = undefined;
                                if (defaultLocation !== -1) {
                                    targetLocation = locRes.result.find(x => x.id === defaultLocation);
                                }

                                let temp = locRes.result;
                                temp.sort(cityCompare);
                                if (targetLocation) {
                                    this.setState({
                                        locations: temp,
                                        defaultLocation: {
                                            city: targetLocation.city,
                                            latitude: targetLocation.latitude,
                                            longitude: targetLocation.longitude,
                                            zoom: targetLocation.zoom
                                        },
                                        mapboxKey: mapboxKey,
                                    });
                                } else {
                                    this.setState({
                                        locations: temp,
                                        mapboxKey: mapboxKey,
                                    });
                                }
                            }
                        })
                        .catch(locErr => console.log(locErr));
                }
            })
            .catch(errSet => console.log(errSet));
    }

    changeLocation(city) {
        const targetLocation = this.state.locations.find(x => x.city === city);
        this.setState({
            defaultLocation: targetLocation,
            locationButtonClass: "asgard-location-button",
            locationMenuClass: "asgard-manager col-6 disposed",
        });
    }

    componentDidMount() {
        this.updateEvents();

        // SSE Event Model Updates
        this.eventSource.addEventListener("models", e => {
                console.log('Received a models update event...') ;   
                this.setState({modelsUpdateToggle: !(this.state.modelsUpdateToggle)});
            }
        );

        // SSE Detected Event Updates
        this.eventSource.addEventListener("events", e => {
            console.log('Received an events update event...');
            this.updateEvents();
        });
    }

    updateEvents() {
        getEvents()
            .then(res => {
                if (res.error_message === '') {

                    res.result.map(evt => {
                        const timeArr = evt.items[0].time.split('T');
                        const topImage = evt.items[0].image_path === '' ? -1 : evt.items[0].image_path;

                        evt['iconHeight'] = remSizeToPix(1);
                        evt['iconWidth']  = remSizeToPix(1);
                        evt['topImage']   = topImage;
                        evt['topText']    = '';
                        evt['date']       = timeArr[0];
                        evt['time']       = timeArr[1];

                        return null;
                    });

                    this.setState({
                        events: this.state.events.concat(res.result)
                    });
                } else {
                    console.log(`An error has ocurred retrieving events: ${res.error_message}`);
                }
            })
            .catch(err => {
                console.log(`An error has ocurred retrieving events: ${err}`);
            });
    }

    componentWillUnmount() {
        // close SSE connection
        this.eventSource.close();
    }

    logoCallback = () => {
        let sidebarMenuVisibility = (this.state.sidebarMenuVisibility === "hidden") ? "shown" : "hidden";
        this.setState({"sidebarMenuVisibility": sidebarMenuVisibility});
        
        let logoPosition = (this.state.logoPosition === "" || this.state.logoPosition === "resting") ? "expanded" : "resting";
        this.setState({"logoPosition": logoPosition});
    }

    gpsCallback = (gpsLocation) => {
        if (gpsLocation === 'disposed') {
            this.setState({"gpsClass": "card asgard-card asgard-gps disposed"});
        } else if(gpsLocation === 'save') {
            this.setState({
                locationsClass: "asgard-manager col-6",
                locationButtonClass: "asgard-location-button",
                locationMenuClass: "asgard-manager col-6 disposed",
                eventModelsClass: "asgard-manager col-6 disposed",
                eventsClass: "asgard-manager col-6 disposed",
                replayerClass: "asgard-manager col-6 disposed",
                datasourcesClass: "asgard-manager col-6 disposed",
                reportsClass: "asgard-manager col-6 disposed",
                alertsClass: "asgard-manager col-6 disposed",
                settingsClass: "asgard-manager col-6 disposed",
                addGPSLocation: this.state.gpsLocation,
            });
        } else {
            this.setState({
                'gpsLocation': gpsLocation,
                'gpsClass': 'card asgard-card asgard-gps',
            });
        }
    }

    sidebarMenuCallback = (option) => {
        switch(option) {
            case "Locations":
                this.setState({
                    locationsClass: "asgard-manager col-6",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6 disposed",
                    eventsClass: "asgard-manager col-6 disposed",
                    replayerClass: "asgard-manager col-6 disposed",
                    datasourcesClass: "asgard-manager col-6 disposed",
                    reportsClass: "asgard-manager col-6 disposed",
                    alertsClass: "asgard-manager col-6 disposed",
                    settingsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break;
            case "EventModels":
                this.setState({
                    locationsClass: "asgard-manager col-6 disposed",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6",
                    eventsClass: "asgard-manager col-6 disposed",
                    replayerClass: "asgard-manager col-6 disposed",
                    datasourcesClass: "asgard-manager col-6 disposed",
                    reportsClass: "asgard-manager col-6 disposed",
                    alertsClass: "asgard-manager col-6 disposed",
                    settingsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break;
            case "Events":
                this.setState({
                    eventsClass: "asgard-manager col-6",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    locationsClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6 disposed",
                    replayerClass: "asgard-manager col-6 disposed",
                    datasourcesClass: "asgard-manager col-6 disposed",
                    reportsClass: "asgard-manager col-6 disposed",
                    alertsClass: "asgard-manager col-6 disposed",
                    settingsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break;
            case "EventReplayer":
                this.setState({
                    replayerClass: "asgard-manager col-6",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    locationsClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6 disposed",
                    eventsClass: "asgard-manager col-6 disposed",
                    datasourcesClass: "asgard-manager col-6 disposed",
                    reportsClass: "asgard-manager col-6 disposed",
                    alertsClass: "asgard-manager col-6 disposed",
                    settingsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break;
            case "Datasources":
                this.setState({
                    datasourcesClass: "asgard-manager col-6",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    locationsClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6 disposed",
                    eventsClass: "asgard-manager col-6 disposed",
                    replayerClass: "asgard-manager col-6 disposed",
                    reportsClass: "asgard-manager col-6 disposed",
                    alertsClass: "asgard-manager col-6 disposed",
                    settingsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break;
            case "Reports":
                this.setState({
                    reportsClass: "asgard-manager col-6",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    locationsClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6 disposed",
                    eventsClass: "asgard-manager col-6 disposed",
                    replayerClass: "asgard-manager col-6 disposed",
                    datasourcesClass: "asgard-manager col-6 disposed",
                    alertsClass: "asgard-manager col-6 disposed",
                    settingsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break; 
            case "Alerts":
                this.setState({
                    alertsClass: "asgard-manager col-6",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    locationsClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6 disposed",
                    eventsClass: "asgard-manager col-6 disposed",
                    replayerClass: "asgard-manager col-6 disposed",
                    datasourcesClass: "asgard-manager col-6 disposed",
                    reportsClass: "asgard-manager col-6 disposed",
                    settingsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break;
            case "Settings":
                this.setState({
                    settingsClass: "asgard-manager col-6",
                    locationButtonClass: "asgard-location-button",
                    locationMenuClass: "asgard-manager col-6 disposed",
                    locationsClass: "asgard-manager col-6 disposed",
                    eventModelsClass: "asgard-manager col-6 disposed",
                    eventsClass: "asgard-manager col-6 disposed",
                    replayerClass: "asgard-manager col-6 disposed",
                    datasourcesClass: "asgard-manager col-6 disposed",
                    reportsClass: "asgard-manager col-6 disposed",
                    alertsClass: "asgard-manager col-6 disposed",
                    gpsClass: "card asgard-card asgard-gps disposed",
                });
                break;
            default:
                break;
        }
    }

    locationButtonCallback = () => {
        this.setState({
            locationButtonClass: "asgard-location-button disposed",
            settingsClass: "asgard-manager col-6 disposed",
            locationMenuClass: "asgard-manager col-6",
            locationsClass: "asgard-manager col-6 disposed",
            eventModelsClass: "asgard-manager col-6 disposed",
            eventsClass: "asgard-manager col-6 disposed",
            replayerClass: "asgard-manager col-6 disposed",
            datasourcesClass: "asgard-manager col-6 disposed",
            reportsClass: "asgard-manager col-6 disposed",
            alertsClass: "asgard-manager col-6 disposed",
            gpsClass: "card asgard-card asgard-gps disposed",
        });
    }

    locationMenuCallback = (city) => {
        this.setState({
            locationButtonClass: "asgard-location-button",
            locationMenuClass: "asgard-manager col-6 disposed",
        });
    }

    locationsCallback = (gpsSet) => {
        if(gpsSet && gpsSet === 'gpsSet') {
            this.setState({
                addGPSLocation: '',
            });
        } else if (gpsSet && gpsSet === 'update'){
            this.updateLocationsList();
        } else {
            this.setState({
                locationsClass: "asgard-manager col-6 disposed",
            });
        }
    }

    eventModelsCallback = () => {
        this.setState({
            eventModelsClass: "asgard-manager col-6 disposed",
        });
    }

    eventsCallback = (anEvent) => {
        if(anEvent === 'disposed') {
            this.setState({
                eventsClass: "asgard-manager col-6 disposed",
            });
        } else {
            this.setState({
                locationMenuClass: "asgard-manager col-6 disposed",
                locationsClass: "asgard-manager col-6 disposed",
                eventModelsClass: "asgard-manager col-6 disposed",
                eventsClass: "asgard-manager col-6",
                replayerClass: "asgard-manager col-6 disposed",
                datasourcesClass: "asgard-manager col-6 disposed",
                reportsClass: "asgard-manager col-6 disposed",
                alertsClass: "asgard-manager col-6 disposed",
                settingsClass: "asgard-manager col-6 disposed",
                targetEvent: anEvent,
            });
        }
    }

    replayerCallback = () => {
        this.setState({
            replayerClass: "asgard-manager col-6 disposed",
        });
    }

    datasourcesCallback = () => {
        this.setState({
            datasourcesClass: "asgard-manager col-6 disposed",
        });
    }

    reportsCallback = () => {
        this.setState({
            reportsClass: "asgard-manager col-6 disposed",
        });
    }

    alertsCallback = () => {
        this.setState({
            alertsClass: "asgard-manager col-6 disposed",
        });
    }

    settingsCallback = () => {
        this.setState({
            settingsClass: "asgard-manager col-6 disposed",
        });
    }

    render() {
        return (
            <React.Fragment>
                <div className="container-fluid">
                    <CityProvider events={this.state.events} 
                                    defaultLocation={this.state.defaultLocation} 
                                    gpsCallback={this.gpsCallback}
                                    eventDetailsCallback={this.eventsCallback}
                                    mapboxToken={this.state.mapboxKey}>
                        <div className="row">
                            <div className="col-md-10 p-0">
                                <Routes />
                            </div>
                        </div>
                    </CityProvider>
                    <Logo className={this.state.logoPosition} callbackFromApp={this.logoCallback}/>
                    <GPSCoordinates displayClass={this.state.gpsClass} gpsLocation={this.state.gpsLocation} callbackFromApp={this.gpsCallback}/>
                    <SidebarMenu className={this.state.sidebarMenuVisibility} callbackFromApp={this.sidebarMenuCallback}/>
                    <LocationButton displayClass={this.state.locationButtonClass} selectedLocation={this.state.defaultLocation} 
                                    openLocationMenu={this.locationButtonCallback}/>
                    <LocationMenu displayClass={this.state.locationMenuClass} callbackFromApp={this.locationMenuCallback} 
                                    changeLocation={this.changeLocation.bind(this)} cities={this.state.locations}
                                    selectedLocation={this.state.defaultLocation}/>
                    <Locations displayClass={this.state.locationsClass} callbackFromApp={this.locationsCallback} addGPSLocation={this.state.addGPSLocation}/>
                    <EventModels displayClass={this.state.eventModelsClass} callbackFromApp={this.eventModelsCallback} modelsUpdate={this.state.modelsUpdateToggle}/>
                    <Events displayClass={this.state.eventsClass} callbackFromApp={this.eventsCallback} events={this.state.events} targetEvent={this.state.targetEvent}/>
                    <Replayer displayClass={this.state.replayerClass} callbackFromApp={this.replayerCallback}/>
                    <Datasources displayClass={this.state.datasourcesClass} callbackFromApp={this.datasourcesCallback} modelsUpdate={this.state.modelsUpdateToggle}/>
                    <Reports displayClass={this.state.reportsClass} callbackFromApp={this.reportsCallback}/>
                    <Alerts displayClass={this.state.alertsClass} callbackFromApp={this.alertsCallback}/>
                    <Settings displayClass={this.state.settingsClass}
                                callbackFromApp={this.settingsCallback} 
                                locations={this.state.locations}
                                mapboxKey={this.state.mapboxKey}
                                updateMapboxKey={this.updateMapboxKey.bind(this)}/>
                    <RealtimeClock />
                    {/*<CatalogPanel />*/}
                </div>
            </React.Fragment>
        );
    }

    updateLocationsList() {
        getLocations()
            .then(locRes => {
                if (locRes.error_message === '' && locRes.result.length > 0) {
                    let temp = locRes.result;
                    temp.sort(cityCompare);
                    this.setState({
                        locations: temp,
                    });
                } else {
                    console.log('App.js - There was an error retrieving locations (or locations were empty): ' + locRes.error_message);
                }
            })
            .catch(err => console.log('Error updating the locations list in App.js: ' + err))
    }

    async updateMapboxKey() {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/mapkey');
        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        this.setState({
            mapboxKey: body.result,
        });
    }
}
