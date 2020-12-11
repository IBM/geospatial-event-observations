/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

import ApplicationSettings from './ApplicationSettings';
import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';
import Icons from './Icons';
import MapKeyDialog from './MapKeyDialog/MapKeyDialog';
import LocationSelector from './LocationSelector';

class Settings extends Component {

    state = {
        'currentTab': 'applicationSettings',
    };

    close() {
        this.props.callbackFromApp();
    }

    render() {
        return (
            <div id="manageSettings" className={this.props.displayClass}>
                <div className="card asgard-card">
                    <DialogHeader title="Application Settings" callback={this.close.bind(this)}/>
                    <div className="card-body asgard-body">
                        <ul className="nav nav-tabs">
                            <li className="asgard-tab active">
                                <a data-toggle="tab" href="#applicationSettings" onClick={this.selectTab.bind(this)}>Application Settings</a>
                            </li>
                            <li className="asgard-tab">
                                <a data-toggle="tab" href="#defaultLocation" onClick={this.selectTab.bind(this)}>Default Location</a>
                            </li>
                            <li className="asgard-tab">
                                <a data-toggle="tab" href="#mapMarkerIcons" onClick={this.selectTab.bind(this)}>Map Marker Icons</a>
                            </li>
                            <li className="asgard-tab">
                                <a data-toggle="tab" href="#mapboxKey" onClick={this.selectTab.bind(this)}>Mapbox Key</a>
                            </li>
                        </ul>
                        <div className="tab-content pt-1">
                            <div id="applicationSettings" className="tab-pane active">
                                <div className="asgard-body-section-header">Manage Application Settings</div>
                                <ApplicationSettings/>
                            </div>
                            <div id="defaultLocation" className="tab-pane">
                                <div className="asgard-body-section-header">Select a Default Location</div>
                                <LocationSelector locations={this.props.locations}/>
                            </div>
                            <div id="mapMarkerIcons" className="tab-pane">
                                <div className="asgard-body-section-header">Manage Map Marker Icons</div>
                                <Icons/>
                            </div>
                            <div id="mapboxKey" className="tab-pane">
                                <div className="asgard-body-section-header">Manage Mapbox Key</div>
                                <MapKeyDialog callback={this.updateMapboxKey.bind(this)} mapboxKey={this.props.mapboxKey}/>
                            </div>
                        </div>
                        <hr/>
                        <DialogFooter callback={this.close.bind(this)}/>
                    </div>
                </div>
            </div>
        );
    }

    selectTab(event) {
        let targetTab = event.target.innerText;
        switch(targetTab) {
            case 'Application Settings':
                targetTab = 'applicationSettings';    
                break;
            case 'Default Location':
                targetTab = 'defaultLocation';
                break;
            case 'Map Marker Icons':
                targetTab = 'mapMarkerIcons';
                break;
            case 'Mapbox Key':
                targetTab = 'mapboxKey';
                break;
            default:
                break;
        }

        if(this.state.currentTab !== targetTab) { 
            // clear any previously selected within the settings tab
            const settingsManager = document.getElementById('manageSettings');
            let selectedElements = settingsManager.getElementsByClassName('asgard-tab');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\bactive\b/g, "");
            });

            // set the target tab to active
            event.target.parentElement.className = event.target.parentElement.className + " active";
            
            // update currentTab state
            this.setState({
                'currentTab': targetTab,
            });
        }
    }

    updateMapboxKey() {
        this.props.updateMapboxKey();
    }

    static getDerivedStateFromError(error) {
        console.log('Settings.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default Settings;