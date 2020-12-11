/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class ApplicationSettings extends Component {
        state = {
            dbIconsLoaded: false,
            dbLocationsLoaded: false,
            dbDiagnostics: false,
            saveSettingsButtonClass: 'btn btn-dark asgard-button',
            saveSettingsClass: 'fas fa-save',
            savingSettings: false,
            saveInProgress: false,
        };

    disableCheckboxes() {
        const settingsManager = document.querySelector('#settingsManager');
        settingsManager.querySelector('#reloadIcons').setAttribute('disabled','');
        settingsManager.querySelector('#reloadLocations').setAttribute('disabled','');
        settingsManager.querySelector('#diagnostics').setAttribute('disabled','');
    }

    enableCheckboxes() {
        const settingsManager = document.querySelector('#settingsManager');
        settingsManager.querySelector('#reloadIcons').removeAttribute('disabled');
        settingsManager.querySelector('#reloadLocations').removeAttribute('disabled');
        settingsManager.querySelector('#diagnostics').removeAttribute('disabled');
    }

    componentDidMount() {
        this.setSettings();
    }

    getSettings = async() => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/settings');
        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    render() {
        return (
            <div id="settingsManager">
                <div className="asgard-multi-column-section form-check">
                    <div className="d-inline-flex mx-auto">
                        <div>
                            <div className="d-flex flex-column p-2">
                                <div className="asgard-field-label">
                                    <label className="form-check-label" htmlFor="reloadIcons">Reload Icons&nbsp;</label>
                                </div>
                            </div>
                            <div className="d-flex flex-column p-2">
                                <div className="asgard-field-label">
                                    <label className="form-check-label" htmlFor="reloadLocations">Reload Locations&nbsp;</label>
                                </div>
                            </div>
                            <div className="d-flex flex-column p-2">
                                <div className="asgard-field-label">
                                    <label className="form-check-label" htmlFor="diagnostics">Diagnostics&nbsp;</label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex flex-column p-2">
                                <div className="asgard-field-label">
                                    <input id="reloadIcons" className="form-check-input" type="checkbox" onChange={this.updateSettings.bind(this)}/>
                                    &nbsp;
                                    <a title="Use this checkbox to reload the default Icons on the next restart. Warning: existing Icons will be deleted.">
                                        <i className="fas fa-question-circle asgard-help"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="d-flex flex-column p-2">
                                <div className="asgard-field-label">
                                    <input id="reloadLocations" className="form-check-input" type="checkbox" onChange={this.updateSettings.bind(this)}/>
                                    &nbsp;
                                    <a title="Use this checkbox to reload the default Locations on the next restart. Warning: existing Locations will be deleted.">
                                        <i className="fas fa-question-circle asgard-help"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="d-flex flex-column p-2">
                                <div className="asgard-field-label">
                                    <input id="diagnostics" className="form-check-input" type="checkbox" onChange={this.updateSettings.bind(this)}/>
                                    &nbsp;
                                    <a title="Use this checkbox to turn application diagnostics information on and off. Diagnostics will be visible in the server logs.">
                                        <i className="fas fa-question-circle asgard-help"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="asgard-multi-column-section align-bottom">
                    <div className="ml-auto mt-auto">
                        { this.state.savingSettings ? (
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

    static getDerivedStateFromError(error) {
        console.log('Location.GetDerivedStateFromError:');
        console.log(error);
    }

    save() {
        if(!this.state.saveInProgress) {
            const settingsManager = document.querySelector('#settingsManager');
            let reloadIcons = !(settingsManager.querySelector('#reloadIcons').checked);
            let reloadLocations = !(settingsManager.querySelector('#reloadLocations').checked);
            let diagnostics = settingsManager.querySelector('#diagnostics').checked;
            
            this.setState({
                'saveInProgress': true,
                'saveSettingsButtonClass': 'btn btn-dark asgard-button disabled',
                'saveSettingsClass': 'fas fa-sync-alt fa-spin',
            });

            this.disableCheckboxes();
            
            const newSettings = {
                'id': 1,
                'locations_loaded': reloadLocations,
                'icons_loaded': reloadIcons,
                'diagnostics': diagnostics,
            };

            this.saveSettings(newSettings)
                .then(res =>{
                    if (res.result === 'Success') {
                        // retrieve the settings
                        this.getSettings()
                            .then(settingsRes => {
                                const latestSettings = settingsRes.result;
                                
                                // set the just added icon as the selected icon
                                this.setState({
                                    'savingSettings': false,
                                    'saveInProgress': false,
                                    'saveSettingsButtonClass': 'btn btn-dark asgard-button',
                                    'saveSettingsClass': 'fas fa-save',
                                    'dbIconsLoaded': latestSettings.locations_loaded,
                                    'dbLocationsLoaded': latestSettings.icons_loaded,
                                    'dbDiagnostics': latestSettings.diagnostics,
                                });

                                this.enableCheckboxes();
                            })
                            .catch(err => console.log(err));
                    } else {
                        console.log('There was a problem updating the settings:' + res.error_message);
                        this.setState({
                            'saveInProgress': false,
                            'saveSettingsButtonClass': 'btn btn-dark asgard-button',
                            'saveSettingsClass': 'fas fa-save',
                        });
                    }
                })
                .catch(err => console.log(err));
        } else {
            console.log('Settings are currently being saved. Please try again later!');
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

    setSettings() {
        this.getSettings()
            .then(res => {
                if (res.error_message === '') {
                    const settings = res.result[0];
                    this.setState({
                        'dbLocationsLoaded': settings.locations_loaded,
                        'dbIconsLoaded': settings.icons_loaded,
                        'dbDiagnostics': settings.diagnostics,
                    });
                    this.updateCheckbox('reloadIcons', settings.icons_loaded);
                    this.updateCheckbox('reloadLocations', settings.locations_loaded);
                    this.updateCheckbox('diagnostics', !(settings.diagnostics));
                } else {
                    console.log('There was an issue retrieving application settings. ' + res.error_message);
                }
            })
            .catch(err => console.log(err));
    }

    updateCheckbox(checkboxId, reload) {
        const settingsManager = document.querySelector('#settingsManager');
        if (!reload) {
            settingsManager.querySelector('#' + checkboxId).setAttribute('checked', '');
        }
    }

    updateSettings(){
        const settingsManager = document.querySelector('#settingsManager');
        const reloadIcons = !(settingsManager.querySelector('#reloadIcons').checked);
        const reloadLocations = !(settingsManager.querySelector('#reloadLocations').checked);
        const diagnostics = settingsManager.querySelector('#diagnostics').checked;

        if ((reloadIcons !== this.state.dbIconsLoaded) || reloadLocations !== this.state.dbLocationsLoaded
            || (diagnostics !== this.state.dbDiagnostics)) {
            this.setState({
                'savingSettings': true,
            });
        } else {
            this.setState({
                'savingSettings': false,
            });
        }
    }
}

export default ApplicationSettings;