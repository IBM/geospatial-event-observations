/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';

import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';
import { getIcons } from '../services/icons';
import { getModels, modelCompare } from '../services/models';
import TextDropdown from './TextDropdown';
import WebhookStep from './WebhookStep';

class Datasources extends Component {
    state = {
        addingDatasource: false,
        addingInProgress: false,
        addDatasourceButtonClass: 'btn btn-dark asgard-button',
        addDatasourceFileList: [],
        addDatasourceIconClass: 'fas fa-save',
        addDBFieldClass: 'disposed d-flex flex-column',
        addFileFieldClass: 'disposed d-flex flex-column',
        addSelectedOption: -1,
        addSelectedDBOption: -1,
        addWebhookFieldClass: 'disposed d-flex flex-column',
        addWebhookSteps: [],
        addWebhookStepContents: [],
        addWebhookStepSelected: 1,
        applyModelsButtonClass: 'btn btn-dark asgard-button',
        applyModelsIconClass: 'fas fa-play',
        currentTab: 'createDatasources',
        currentDetailsTab: 'datasourceDetails',
        datasources: [],
        datasourceTypeIcons: {'File': 'fas fa-file', 'Database': 'fas fa-database', 'Webhook': 'fas fa-code'},
        dbOptions: ['Microsoft SQL Server','MySQL','Oracle','PostgreSQL','SQLite'],
        editDatasourceClass: 'disposed asgard-multi-column-section w-80 px-2',
        editDatasourceSelected: -1,
        editingDatasource: false,
        editInProgress: false,
        editDatasourceButtonClass: 'btn btn-dark asgard-button',
        editDatasourceFileList: [],
        editDatasourceIconClass: 'fas fa-save',
        editDBFieldClass: 'disposed d-flex flex-column',
        editFileFieldClass: 'disposed d-flex flex-column',
        editModelSelected: -1,
        editSelectedOption: -1,
        editSelectedDBOption: -1,
        editWebhookFieldClass: 'disposed d-flex flex-column',
        editWebhookSteps: [],
        editWebhookStepContents: [],
        editWebhookStepSelected: 1,
        icons: [],
        models: [],
        removeInProgress: false,
        removeDatasourceButtonClass: 'btn btn-dark asgard-button',
        removeDatasourceIconClass: 'fas fa-trash-alt',
        typeOptions: ['File', 'Database', 'Webhook'],
    };

    constructor(props) {
        super(props);

        this.add = this.add.bind(this);
        this.addDatasource = this.addDatasource.bind(this);
        this.addDatasourceWithFile = this.addDatasourceWithFile.bind(this);
        this.addInitialWebhookStep = this.addInitialWebhookStep.bind(this);
        this.addWebhookStep = this.addWebhookStep.bind(this);
        this.apply = this.apply.bind(this);
        this.clearActiveSubtab = this.clearActiveSubtab.bind(this);
        this.clearDBFields = this.clearDBFields.bind(this);
        this.clearDatasourceTypeFields = this.clearDatasourceTypeFields.bind(this);
        this.clearFileFields = this.clearFileFields.bind(this);
        this.clearWebhookFields = this.clearWebhookFields.bind(this);
        this.close = this.close.bind(this);
        this.compareWebhookDatasources = this.compareWebhookDatasources.bind(this);
        this.datasourceCompare = this.datasourceCompare.bind(this);
        this.datasourceSelect = this.datasourceSelect.bind(this);
        this.dbTypeSelectionCallback = this.dbTypeSelectionCallback.bind(this);
        this.getDatasourceObject = this.getDatasourceObject.bind(this);
        this.getDatasources = this.getDatasources.bind(this);
        this.getDBDatasourceObject = this.getDBDatasourceObject.bind(this);
        this.getFileDatasourceObject = this.getFileDatasourceObject.bind(this);
        this.getWHDatasourceObject = this.getWHDatasourceObject.bind(this);
        this.modelSelect = this.modelSelect.bind(this);
        this.remove = this.remove.bind(this);
        this.removeDatasource = this.removeDatasource.bind(this);
        this.removeWebhookStep = this.removeWebhookStep.bind(this);
        this.reRegisterListeners = this.reRegisterListeners.bind(this);
        this.save = this.save.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.toggleInProgress = this.toggleInProgress.bind(this);
        this.toggleRemoveInProgress = this.toggleRemoveInProgress.bind(this);
        this.typeSelectionCallback = this.typeSelectionCallback.bind(this);
        this.updateAddFields = this.updateAddFields.bind(this);
        this.updateDatasources = this.updateDatasources.bind(this);
        this.updateDatasourcesList = this.updateDatasourcesList.bind(this);
        this.updateEditFields = this.updateEditFields.bind(this);
        this.updateFileList = this.updateFileList.bind(this);
        this.updateFilterFields = this.updateFilterFields.bind(this);
        this.updateModels = this.updateModels.bind(this);
        this.updateModelsList = this.updateModelsList.bind(this);
        this.updateSelectedFieldClasses = this.updateSelectedFieldClasses.bind(this);
        this.updateWebhookStep = this.updateWebhookStep.bind(this);
        this.uploadData = this.uploadData.bind(this);
        this.validDatasource = this.validDatasource.bind(this);
        this.validString = this.validString.bind(this);
    }

    add() {
        if (!this.state.addingInProgress) {
            if (this.state.addSelectedOption !== -1) {
                const dsType = this.state.typeOptions[this.state.addSelectedOption];
                const aDatasource = this.getDatasourceObject(dsType, 'add');
                
                if (aDatasource !== null && this.validDatasource(aDatasource)) {
                    // set add in progress
                    this.toggleInProgress('add');

                    if (dsType === 'File') {
                        this.addDatasourceWithFile(aDatasource);
                    } else {
                        this.addDatasource(aDatasource)
                            .then( res => {
                                // check for success
                                if (res.result === 'Success') {
                                    // clear the create fields
                                    this.updateSelectedFieldClasses('add', 3);
                                    this.clearDatasourceTypeFields('add', 3);

                                    // refresh the cities list
                                    this.updateDatasourcesList();

                                    this.setState({
                                        'addingDatasource': false,
                                    });
                                } else {
                                    console.log('There was a problem adding the new datasource: ' + res.error_message);
                                }
                                this.toggleInProgress('add');
                            })
                            .catch( addErr => {
                                console.log(addErr);
                                this.toggleInProgress('add');
                            });
                    }
                } else {
                    console.log('Validation of the Add Datasource fields failed.');
                }
            } else {
                console.log('Datasource type not selected!');
            }
        } else {
            console.log('A new model is currently being added. Please try again later!');
        }
    }

    addDatasource = async(aDatasource) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/datasources', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aDatasource),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;    
    }

    addDatasourceWithFile(aDatasource) {
        //create a new FormData object to send the file
        let formData = new FormData();
        formData.append('type', 'datasource');
        formData.append('storageType', 'Filesystem');
        formData.append('name', aDatasource.name);
        formData.append('file', this.state.addDatasourceFileList[0], this.state.addDatasourceFileList[0].name);
        // upload the training data first and then create the event model
        this.uploadData(formData, 'PUT')
            .then( uploadRes => {
                // check that the data was uploaded successfully
                if (uploadRes.result === 'Success') {
                    // add the data path to the DS object
                    aDatasource.path = uploadRes.dataPath;

                    this.addDatasource(aDatasource)
                        .then(addRes => {
                            if (addRes.result === 'Success') {
                                // clear the create fields
                                this.updateSelectedFieldClasses('add', 3);
                                this.clearDatasourceTypeFields('add', 3);

                                // refresh the cities list
                                this.updateDatasourcesList();

                                this.setState({
                                    'addingDatasource': false,
                                });
                            } else {
                                console.log('There was a problem adding the new datasource: ' + addRes.error_message);
                                // TODO: should delete the uploaded data
                            }
                            this.toggleInProgress('add');
                        })
                        .catch(addDSErr => {
                            console.log(addDSErr);
                            // TODO: should delete the uploaded data
                            this.toggleInProgress('add');
                        });
                } else {
                    console.log('There was a problem uploading the file associated with the File Datasource data: ' + uploadRes.error_message);
                    this.toggleInProgress('add');
                }
            })
            .catch( err => {
                console.log(err);
                this.toggleInProgress('add');
            });
    }

    addInitialWebhookStep() {
        let tempSteps = [];
        let tempContents = [];
        const newStep = {
            href: '#step1',
            text: 'Step 1'
        };
        const newContent = {
            id: 'add_1',
            requestParams: [],
            responseParams: [],
            responseHandledByEndpoint: false,
            stepStageActive: 'Request'
        };
        tempSteps.push(newStep);
        tempContents.push(newContent);
        //const content1 = <WebhookStep id={1} active={this.state.addWebhookStepSelected}/>
        ReactDOM.render(
            <WebhookStep id={newContent.id}
                            requestParams={newContent.requestParams}
                            responseParams={newContent.responseParams}
                            responseHandledByEndpoint={newContent.responseHandledByEndpoint}
                            stepStageActive={newContent.stepStageActive}
                            updateCallback={this.updateWebhookStep.bind(this)}
                            active={1}/>, 
            document.querySelector('#add_Step_Container_1')
        );
        this.setState({
            'addWebhookSteps': tempSteps,
            'addWebhookStepContents': tempContents,
            'addWebhookStepSelected': 1,
        }, this.updateAddFields());
    }

    addWebhookStep(event) {
        const datasourcesManager = document.querySelector('#manageDatasources');
        const targetId = this.validString(event.target.id) ? event.target.id : event.target.parentElement.id;
        const prefix = targetId.substring(0,1) === 'a' ? 'add' : 'edit';

        // increment the current count
        let count = ((prefix === 'add') ? this.state.addWebhookSteps.length : this.state.editWebhookSteps.length) + 1;

        // deactivate the current nav 
        let webhookStepNav = datasourcesManager.querySelector('#' + prefix + 'WebhookStepNav');
        let selectedElements = webhookStepNav.getElementsByClassName('active');
        [].forEach.call(selectedElements, function(selectedElement) {
            selectedElement.className = selectedElement.className.replace(/\b active\b/g, "");
            selectedElement.className = selectedElement.className.replace(/\bactive show\b/g, "");
        });

        for (let i = 0; i < count; i++) {
            // unmount all components
            ReactDOM.unmountComponentAtNode(document.querySelector('#' + prefix + '_Step_Container_' + (i+1)));
        }

        // update the steps
        let temp = [];
        let tempContents = [];
        if (prefix === 'add') {
            temp = this.state.addWebhookSteps.slice(0);
            tempContents = this.state.addWebhookStepContents.slice(0);
            
            const nextStep = {
                href: '#step' + count,
                text: 'Step ' + count
            };
            const nextContent = {
                id: prefix + '_' + count,
                requestParams: [],
                responseParams: [],
                responseHandledByEndpoint: false,
                stepStageActive: 'Request'
            };
            
            temp.push(nextStep);
            tempContents.push(nextContent);
            for (let j=0; j < tempContents.length; j++) {
                ReactDOM.render(
                    <WebhookStep id={tempContents[j].id}
                                    requestParams={tempContents[j].requestParams}
                                    responseParams={tempContents[j].responseParams}
                                    responseHandledByEndpoint={tempContents[j].responseHandledByEndpoint}
                                    stepStageActive={tempContents[j].stepStageActive}
                                    updateCallback={this.updateWebhookStep.bind(this)}
                                    active={count}/>, 
                    document.querySelector('#' + prefix + '_Step_Container_' + (j+1))
                );
            }
            
            this.setState({
                'addWebhookSteps': temp,
                'addWebhookStepContents': tempContents,
                'addWebhookStepSelected': count,
            }, this.updateAddFields());
        } else {
            temp = this.state.editWebhookSteps.slice(0);
            tempContents = this.state.editWebhookStepContents.slice(0);
            const nextStep = {
                href: '#step' + count,
                text: 'Step ' + count
            };
            const nextContent = {
                id: prefix + '_' + count,
                requestParams: [],
                responseParams: [],
                responseHandledByEndpoint: false,
                stepStageActive: 'Request'
            };
            
            temp.push(nextStep);
            tempContents.push(nextContent);
            for (let j=0; j < tempContents.length; j++) {
                ReactDOM.render(
                    <WebhookStep id={tempContents[j].id}
                                    requestParams={tempContents[j].requestParams}
                                    responseParams={tempContents[j].responseParams}
                                    responseHandledByEndpoint={tempContents[j].responseHandledByEndpoint}
                                    stepStageActive={tempContents[j].stepStageActive}
                                    updateCallback={this.updateWebhookStep.bind(this)}
                                    active={count}/>, 
                    document.querySelector('#' + prefix + '_Step_Container_' + (j+1))
                );
            }

            this.setState({
                'editWebhookSteps': temp,
                'editWebhookStepContents': tempContents,
                'editWebhookStepSelected': count,
            }, this.updateEditFields());
        }
    }

    apply() {
        if (this.state.editDatasourceSelected !== -1) {
            if (this.state.editModelSelected !== -1) {
                // set in progress
                this.setState({
                    'applyModelsButtonClass': 'btn btn-dark asgard-button disabled',
                    'applyModelsIconClass': 'fas fa-sync-alt fa-spin',
                });

                let targetDatasource = this.state.datasources.find(ds => ds.id === this.state.editDatasourceSelected);
                let targetModel = this.state.models.find(model => model.id === this.state.editModelSelected);

                // concat the objects and send to Datasources api
                targetDatasource['action'] = 'apply';
                targetDatasource['model'] = targetModel;

                setTimeout(() => {
                    this.applyModel(targetDatasource)
                        .then(res => {
                            this.setState({
                                'applyModelsButtonClass': 'btn btn-dark asgard-button',
                                'applyModelsIconClass': 'fas fa-play',
                            });
                        })
                        .catch(err => console.log(err));
                }, 3000);
            } else {
                console.log('No Model selected for application');
            }
        } else {
            console.log('Please select a Datasource before applying an Event Model to it');
        }
    }

    applyModel = async(aDatasource) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/datasources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aDatasource),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;    
    }

    clearActiveSubtab(event) {
        const prefix = event.target.id.substring(0,1) === 'a' ? 'add' : 'edit';
        const id = event.target.id;
        const targetStep = parseInt(id.substring(id.lastIndexOf('v')+1), 10);

        if (targetStep !== (prefix === 'add' ? this.state.addWebhookStepSelected : this.state.editWebhookStepSelected)) {
            const datasourcesManager = document.querySelector('#manageDatasources');
            let webhookStepNav = datasourcesManager.querySelector('#' + prefix + 'WebhookStepNav');
            let selectedElements = webhookStepNav.getElementsByClassName('active');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\b active\b/g, "");
            });

            const numberOfSteps = ((prefix === 'add') ? this.state.addWebhookSteps.length : this.state.editWebhookSteps.length);

            for (let j=0; j < numberOfSteps; j++) {
                let step = j + 1;
                // unmount all components
                ReactDOM.unmountComponentAtNode(document.querySelector('#' + prefix + '_Step_Container_' + step));
            }

            for (let i = 0; i < numberOfSteps; i++) {
                let step = i + 1;
                
                //rerender with new active
                if (prefix === 'add') {
                    ReactDOM.render(
                        <WebhookStep id={this.state.addWebhookStepContents[i].id}
                                    requestParams={this.state.addWebhookStepContents[i].requestParams}
                                    responseParams={this.state.addWebhookStepContents[i].responseParams}
                                    responseHandledByEndpoint={this.state.addWebhookStepContents[i].responseHandledByEndpoint}
                                    stepStageActive={this.state.addWebhookStepContents[i].stepStageActive}
                                    updateCallback={this.updateWebhookStep.bind(this)}
                                    active={targetStep}/>, 
                        document.querySelector('#' + prefix + '_Step_Container_' + step)
                    );
                } else {
                    ReactDOM.render(
                        <WebhookStep id={this.state.editWebhookStepContents[i].id}
                                    requestParams={this.state.editWebhookStepContents[i].requestParams}
                                    responseParams={this.state.editWebhookStepContents[i].responseParams}
                                    responseHandledByEndpoint={this.state.editWebhookStepContents[i].responseHandledByEndpoint}
                                    stepStageActive={this.state.editWebhookStepContents[i].stepStageActive}
                                    updateCallback={this.updateWebhookStep.bind(this)}
                                    active={targetStep}/>, 
                        document.querySelector('#' + prefix + '_Step_Container_' + step)
                    );
                }
            }

            // set the selected subtab
            if (prefix === 'add') {
                this.setState({
                    'addWebhookStepSelected': targetStep,
                });
            } else {
                this.setState({
                    'editWebhookStepSelected': targetStep,
                });
            }
        }
    }

    clearDatasourceName(prefix) {
        const datasourceManager = document.querySelector('#manageDatasources');
        datasourceManager.querySelector('#' + prefix + 'DatasourceName').value = '';
    }

    clearDBFields(prefix) {
        const datasourceManager = document.querySelector('#manageDatasources');
        datasourceManager.querySelector('#' + prefix + 'DBHostname').value = '';
        datasourceManager.querySelector('#' + prefix + 'DBName').value = '';
        datasourceManager.querySelector('#' + prefix + 'DBUsername').value = '';
        datasourceManager.querySelector('#' + prefix + 'DBPassword').value = '';
        datasourceManager.querySelector('#' + prefix + 'DBTable').value = '';
    }

    clearDatasourceTypeFields(target, anId) {
        if (target && target.substring(0,3) === 'add') { // clear add fields
            switch(anId) {
                case 0: // file type selected, clear DB and Webhook fields
                    this.setState({
                        addSelectedDBOption: -1,
                    });
                    this.clearDBFields('add');
                    this.clearWebhookFields('add');
                    break;
                case 1: // database type selected, clear File and Webhook fields
                    this.clearFileFields('add');
                    this.clearWebhookFields('add');
                    break;
                case 2: // webhook type selectec, clear File and DB fields
                    this.clearFileFields('add');
                    this.setState({
                        addSelectedDBOption: -1,
                    });
                    this.clearDBFields('add');
                    break;
                default:
                    this.clearDatasourceName('add');
                    this.clearFileFields('add');
                    this.setState({
                        addSelectedOption: -1,
                        addSelectedDBOption: -1,
                    });
                    this.clearDBFields('add');
                    this.clearWebhookFields('add');
                    break;
            }
        } else { //clear edit fields
            switch(anId) {
                case 0: // file type selected, clear DB and Webhook fields
                    this.setState({
                        editSelectedDBOption: -1,
                    });
                    this.clearDBFields('edit');
                    this.clearWebhookFields('edit');
                    break;
                case 1: // database type selected, clear File and Webhook fields
                    this.clearFileFields('edit');
                    this.clearWebhookFields('edit');
                    break;
                case 2: // webhook type selectec, clear File and DB fields
                    this.clearFileFields('edit');
                    this.setState({
                        editSelectedDBOption: -1,
                    });
                    this.clearDBFields('edit');
                    break;
                default:
                    this.clearDatasourceName('edit');
                    this.clearFileFields('edit');
                    this.setState({
                        editSelectedOption: -1,
                        editSelectedDBOption: -1,
                    });
                    this.clearDBFields('edit');
                    this.clearWebhookFields('edit');
                    break;
            }
        }       
    }

    clearFileFields(prefix) {
        const datasourceManager = document.querySelector('#manageDatasources');
        datasourceManager.querySelector('#' + prefix + 'DatasourceFile').value = '';
    }

    clearWebhookFields(prefix) {
        let id = prefix + '_Remove_Step';
        const datasourceManager = document.querySelector('#manageDatasources');
        datasourceManager.querySelector('#' + prefix + 'WHHost').value = '';

        const steps = prefix === 'add' ? 
            this.state.addWebhookStepContents.length : this.state.editWebhookStepContents.length;

        for (let i=0; i < steps; i++) {
            id = id + (i+1);
            const event = {
                target: {'id': id}
            };
            this.removeWebhookStep(event);
        }

        if (prefix === 'add') {
            this.addInitialWebhookStep();
        }
    }

    close() {
        this.props.callbackFromApp();
    }

    compareWebhookDatasources(webhookA, webhookB) {
        let stepCheck = webhookA.steps.length === webhookB.steps.length;
        if (stepCheck) {
            for (let i=0; i < webhookA.steps.length; i++) {
                if (webhookA.steps[i].request.length === webhookB.steps[i].request.length
                        && webhookA.steps[i].response.length === webhookB.steps[i].response.length
                        && webhookA.steps[i].responseHandledByEndpoint === webhookB.steps[i].responseHandledByEndpoint) {
                    for (let j=0; j < webhookA.steps[i].request.length; j++) {
                        if (webhookA.steps[i].request[j].param === webhookB.steps[i].request[j].param
                                && webhookA.steps[i].request[j].paramValue === webhookB.steps[i].request[j].paramValue
                                && webhookA.steps[i].request[j].valueSecured === webhookB.steps[i].request[j].valueSecured
                                && webhookA.steps[i].request[j].linkedParam === webhookB.steps[i].request[j].linkedParam) {
                            continue;
                        } else {
                            stepCheck = false;
                            break;
                        }
                    }

                    for (let k=0; k < webhookA.steps[i].response.length; k++) {
                        if (webhookA.steps[i].response[k].param === webhookB.steps[i].response[k].param) {
                            continue;
                        } else {
                            stepCheck = false;
                            break;
                        }
                    }
                } else {
                    stepCheck = false;
                    break;
                }
            }
        }
        return webhookA.name === webhookB.name
                && webhookA.host === webhookB.host && stepCheck;
    }

    componentDidMount() {
        this.updateDatasourcesList();
        this.addInitialWebhookStep();
        this.updateModelsList();
        this.updateIconsList();
    }

    componentDidUpdate(prevProps) {
        this.reRegisterListeners();
        this.updateAddFields();
        this.updateEditFields();

        if (prevProps.modelsUpdate !== this.props.modelsUpdate) {
            console.log('We need to update the Models List!');
            this.updateModelsList();
            this.updateIconsList();
        }
    }

    datasourceCompare(a, b) {
        let dsA = a.name.toUpperCase();
        let dsB = b.name.toUpperCase();
        if (dsA > dsB) {
            return 1;
        }
        if (dsA < dsB) {
            return -1;
        }
        return 0;
    }

    datasourceSelect(event) {
        let elementId = (event.target.id).toString();
        let datasourceId = parseInt(elementId.substring(9), 10);

        if (this.state.editDatasourceSelected !== datasourceId) {
            // clear any previously selected
            const datasourcesManager = document.querySelector('#manageDatasources');
            let selectedElements = datasourcesManager.getElementsByClassName('asgard-list-group-item-selected');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\b asgard-list-group-item-selected\b/g, "");
            });
            
            // retrieve the model object
            let targetDatasource = this.state.datasources.find(x => x.id === datasourceId);

            //set the item as selected
            this.setState({
                'editDatasourceSelected': datasourceId,
            });

            event.target.className = event.target.className + " asgard-list-group-item-selected";

            // add fields
            switch(targetDatasource.type) {
                case 'File':
                    this.setFileDatasourceFields(targetDatasource);
                    break;
                
                case 'Database':
                    this.setDBDatasourceFields(targetDatasource);
                    break;
                
                case 'Webhook':
                    this.setWHDatasourceFields(targetDatasource);
                    break;
                
                default:
                    break;
            }

            // make the edit fields visible
            this.setState({
                'editDatasourceClass': 'asgard-multi-column-section w-80 px-2',
            });

            // if a model has just been selected it is not being edited yet - disable editing
            if (this.state.editingDatasource) {
                this.setState({'editingDatasource': false});
                // disable the save button
            }
        }
    }

    dbTypeSelectionCallback(target, anId) {
        if (target.substring(0,3) === 'add') {
            if (target.indexOf('FieldCheck') !== -1) {
                this.updateAddFields();
            } else {
                this.setState({
                    'addSelectedDBOption': anId,
                });
            }
        } else {
            if (target.indexOf('FieldCheck') !== -1) {
                this.updateEditFields();
            } else {
                this.setState({
                    'editSelectedDBOption': anId,
                });
            }
        }
    }

    getDatasourceObject(dsType, prefix) {
        let aDatasource = null;
        switch(dsType) {
            case 'File':
                aDatasource = this.getFileDatasourceObject(prefix);
                break;
            case 'Database':
                aDatasource = this.getDBDatasourceObject(prefix);
                break;
            case 'Webhook':
                aDatasource = this.getWHDatasourceObject(prefix);
                break;
            default:
                break;
        }
        return aDatasource;
    }

    getDatasources = async() => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/datasources');
        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    getDBDatasourceObject(prefix) {
        const datasourceManager = document.querySelector('#manageDatasources');
        const name = datasourceManager.querySelector('#' + prefix + 'DatasourceName').value;
        const host = datasourceManager.querySelector('#' + prefix + 'DBHostname').value;
        const db = datasourceManager.querySelector('#' + prefix + 'DBName').value;
        const username = datasourceManager.querySelector('#' + prefix + 'DBUsername').value;
        const password = datasourceManager.querySelector('#' + prefix + 'DBPassword').value;
        const table = datasourceManager.querySelector('#' + prefix + 'DBTable').value;
        const dbType = prefix === 'add' ? 
                        this.state.dbOptions[this.state.addSelectedDBOption] : this.state.dbOptions[this.state.editSelectedDBOption];
        return {
            'name': name,
            'type': 'Database',
            'dbType': dbType,
            'host': host,
            'db': db,
            'username': username,
            'password': password,
            'table': table
        };
    }

    getFileDatasourceObject(prefix) {
        const datasourceManager = document.querySelector('#manageDatasources');
        const name = datasourceManager.querySelector('#' + prefix + 'DatasourceName').value;
        const filename = prefix === 'add' ?
                            this.state.addDatasourceFileList[0].name : this.state.editDatasourceFileList[0].name;
        return {
            'name': name,
            'type': 'File',
            'filename': filename
        };
    }

    getWHDatasourceObject(prefix) {
        const datasourceManager = document.querySelector('#manageDatasources');
        const name = datasourceManager.querySelector('#' + prefix + 'DatasourceName').value;
        const host = datasourceManager.querySelector('#' + prefix + 'WHHost').value;
        const steps = prefix === 'add' ?
                        this.state.addWebhookStepContents : this.state.editWebhookStepContents;
        let temp = [];
        for (let i=0; i < steps.length; i++) {
            let step = {
                'request': steps[i].requestParams,
                'response': steps[i].responseParams,
                'responseHandledByEndpoint': steps[i].responseHandledByEndpoint
            };
            temp.push(step);
        }

        return {
            'name': name,
            'host': host,
            'type': 'Webhook',
            'steps': temp
        };
    }

    modelSelect(event) {
        let elementId = (event.target.id).toString();
        let modelId = parseInt(elementId.substring(9), 10);

        if (this.state.editModelSelected !== modelId) {
            // clear any previously selected
            const datasourcesManager = document.querySelector('#applyModels');
            let selectedElements = datasourcesManager.getElementsByClassName('asgard-list-group-item-selected');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\b asgard-list-group-item-selected\b/g, "");
            });

            if (elementId.substring(0,1) === 'e') {
                event.target.className = event.target.className + " asgard-list-group-item-selected";
            } else if (elementId.substring(0,1) === 'i') {
                event.target.parentElement.className = event.target.parentElement.className + " asgard-list-group-item-selected";
            }

            // set the item as selected
            // make the edit fields visible and set the icon
            // if a model has just been selected it is not being edited yet - disable editing
            this.setState({
                'editModelSelected': modelId,
            });
        }
    }

    remove() {
        if (!this.state.removeInProgress) {
            if (this.state.editDatasourceSelected !== -1) {
                // update the remove button to indicate progress
                this.toggleRemoveInProgress();

                let target = this.state.datasources.find(x => x.id === this.state.editDatasourceSelected);
                this.removeDatasource(target)
                    .then( res => {
                        // check for success
                        if (res.result === 'Success') {
                            // clear and hide the edit fields
                            this.clearDatasourceTypeFields('edit', 3);
                            this.setState({
                                'editDatasourceClass': 'disposed asgard-multi-column-section w-80 px-2',
                                'editDatasourceSelected': -1,
                            });

                            // refresh the cities list
                            this.updateDatasourcesList();
                        } else {
                            console.log('There was a problem deleting the selected datasource: ' + res.error_message);
                        }
                        this.toggleRemoveInProgress();
                    })
                    .catch(err => {
                        console.log(err);
                        this.toggleRemoveInProgress();
                    });
            }
        } else {
            console.log('A datasource is currently being deleted. Please try again later!');
        }
    }

    removeDatasource = async(aDatasource) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/datasources', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aDatasource),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    removeWebhookStep(event) {
        const id = event.target.id;
        const prefix = id.substring(0,id.indexOf('_'));
        const stepId = parseInt(id.substring(id.lastIndexOf('p') + 1), 10);

        // remove the subtab content div
        // let datasourcesManager = document.querySelector('#manageDatasources');
        // let webhookStepContent = datasourcesManager.querySelector('#' + prefix + 'WebhookStepContent');


        let temp = [];
        let tempContents = [];
        let targetArrayIndex = stepId - 1;
        const numberOfSteps = ((prefix === 'add') ? this.state.addWebhookSteps.length : this.state.editWebhookSteps.length);
        for (let i = 0; i < numberOfSteps; i++) {
            // unmount all components
            ReactDOM.unmountComponentAtNode(document.querySelector('#' + prefix + '_Step_Container_' + (i+1)));

            // elements before target
            if (i < targetArrayIndex) {
                if (prefix === 'add') {
                    temp.push(this.state.addWebhookSteps[i]);
                    tempContents.push(this.state.addWebhookStepContents[i]);
                } else {
                    temp.push(this.state.editWebhookSteps[i]);
                    tempContents.push(this.state.editWebhookStepContents[i]);
                }
            } else if (i > targetArrayIndex) { // elements after target
                // decrement any subsequent subtabs
                const newNav = {
                    href: '#step' + i,
                    text: 'Step ' + i
                };
                temp.push(newNav);

                let newStep = null;
                if (prefix === 'add') {
                    newStep = this.state.addWebhookStepContents[i];
                    newStep.id = 'add_' + i;
                    newStep.requestParams = this.state.addWebhookStepContents[i].requestParams;
                    newStep.responseParams = this.state.addWebhookStepContents[i].responseParams;
                    newStep.responseHandledByEndpoint = this.state.addWebhookStepContents[i].responseHandledByEndpoint;
                    newStep.stepStageActive = this.state.addWebhookStepContents[i].stepStageActive;
                } else {
                    newStep = this.state.editWebhookStepContents[i];
                    newStep.id = 'edit_' + i;
                    newStep.requestParams = this.state.editWebhookStepContents[i].requestParams;
                    newStep.responseParams = this.state.editWebhookStepContents[i].responseParams;
                    newStep.responseHandledByEndpoint = this.state.editWebhookStepContents[i].responseHandledByEndpoint;
                    newStep.stepStageActive = this.state.editWebhookStepContents[i].stepStageActive;   
                }
                tempContents.push(newStep);
            }
        }

        let updatedStepSelected = 1;
        if (prefix === 'add') {
            // what should now be selected?
            if (stepId === this.state.addWebhookStepSelected) { // currently selected was deleted
                if (stepId === this.state.addWebhookSteps.length) { // currently selected was last
                    updatedStepSelected = stepId - 1;
                } else { // whatever now replaces that step should be selected
                    updatedStepSelected = stepId;
                }
            } else { // another step was deleted, currently selected should remain selected
                if (stepId < this.state.addWebhookStepSelected) { // if the step deleted was lower, decrement currently selected only
                    updatedStepSelected = this.state.addWebhookStepSelected - 1;
                } else { // if the deleted step was greater that currently selected, do nothing
                    updatedStepSelected = this.state.addWebhookStepSelected;
                }
            }

            this.setState({
                'addWebhookSteps': temp,
                'addWebhookStepContents': tempContents,
                'addWebhookStepSelected': updatedStepSelected,
            });
        } else {
            // what should now be selected?
            //let updatedStepSelected = 1;
            if (stepId === this.state.editWebhookStepSelected) { // currently selected was deleted
                if (stepId === this.state.editWebhookSteps.length) { // currently selected was last
                    updatedStepSelected = stepId - 1;
                } else { // whatever now replaces that step should be selected
                    updatedStepSelected = stepId;
                }
            } else { // another step was deleted, currently selected should remain selected
                if (stepId < this.state.editWebhookStepSelected) { // if the step deleted was lower, decrement currently selected only
                    updatedStepSelected = this.state.editWebhookStepSelected - 1;
                } else { // if the deleted step was greater that currently selected, do nothing
                    updatedStepSelected = this.state.editWebhookStepSelected;
                }
            }

            this.setState({
                'editWebhookSteps': temp,
                'editWebhookStepContents': tempContents,
                'editWebhookStepSelected': updatedStepSelected,
            });
        }

        // re-render Webhook Steps 2-n
        for (let j=0; j < tempContents.length; j++) {
            ReactDOM.render(
                <WebhookStep id={tempContents[j].id}
                                requestParams={tempContents[j].requestParams}
                                responseParams={tempContents[j].responseParams}
                                responseHandledByEndpoint={tempContents[j].responseHandledByEndpoint}
                                stepStageActive={tempContents[j].stepStageActive}
                                updateCallback={this.updateWebhookStep.bind(this)}
                                active={updatedStepSelected}/>, 
                document.querySelector('#' + prefix + '_Step_Container_' + (j+1))
            );
        }

        prefix === 'add' ? this.updateAddFields() : this.updateEditFields();
    }

    render() {
        return (
            <div id="manageDatasources" className={this.props.displayClass}>
                <div className="card asgard-card">
                    <DialogHeader title="Manage Datasources" callback={this.close.bind(this)}/>
                    <div className="card-body asgard-body">
                        <ul className="nav nav-tabs">
                            <li className="asgard-tab active">
                                <a data-toggle="tab" href="#createDatasources" onClick={this.selectTab.bind(this)}>Create a Datasource</a>
                            </li>
                            <li className="asgard-tab">
                                <a data-toggle="tab" href="#editDatasources" onClick={this.selectTab.bind(this)}>Edit &amp; Delete Datasources</a>
                            </li>
                        </ul>
                        <div className="tab-content pt-1">
                            <div id="createDatasources" className="tab-pane active">
                                <div className="asgard-body-section-header">Add a new Datasource</div>
                                <div>
                                    <div className="asgard-multi-column-section w-75">
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDatasourceName">Name&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addTypeDropdown">Type&nbsp;</label>
                                                </div>
                                            </div>
                                            {/*File field labels*/}
                                            <div className={this.state.addFileFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDatasourceFile">File&nbsp;</label>
                                                </div>
                                            </div>
                                            {/*Database field labels*/}
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDBTypeDropdown">DB Type&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDBHostname">Host&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDBName">Database&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDBUsername">Username&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDBPassword">Password&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addDBTable">Table&nbsp;</label>
                                                </div>
                                            </div>
                                            {/*Webhook label*/}
                                            <div className={this.state.addWebhookFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addWHHost">Host&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className={this.state.addWebhookFieldClass}>
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addWebhookStepNav">Steps&nbsp;</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-100">
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <input id="addDatasourceName" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="A user-defined, unique name for the Datasource e.g. Internet Text, Crime scene images">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label d-flex">
                                                    <TextDropdown id="addTypeDropdown"
                                                                label="Datasource Type"
                                                                options={this.state.typeOptions} 
                                                                selectedOption={this.state.addSelectedOption}
                                                                callback={this.typeSelectionCallback.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Select the Datasource type. See the documentation for more information.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            {/*File field inputs*/}
                                            <div className={this.state.addFileFieldClass}>
                                                <div className="asgard-field-label">
                                                    <input id="addDatasourceFile" className="input-sm" type="file" onChange={this.updateFileList.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Upload the datasource archive file containing text and image data.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            {/*Database field inputs*/}
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label d-flex">
                                                    <TextDropdown id="addDBTypeDropdown"
                                                                label="Database Type"
                                                                options={this.state.dbOptions} 
                                                                selectedOption={this.state.addSelectedDBOption}
                                                                callback={this.dbTypeSelectionCallback.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Select the Database type.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <input id="addDBHostname" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="The FQDN of the DB server e.g. database.domain.com">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <input id="addDBName" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="The name of the database hosted on the DB server that will be used.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <input id="addDBUsername" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="The DB username that will be used to query text and image information.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <input id="addDBPassword" className="input-sm" onChange={this.updateAddFields.bind(this)} type="password"/>
                                                    &nbsp;
                                                    <a title="The password for the DB username that will be used to query text and image information.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={this.state.addDBFieldClass}>
                                                <div className="asgard-field-label">
                                                    <input id="addDBTable" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="The DB Table to be queried. See documentation for expected table structure.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            {/*Webhook field inputs*/}
                                            <div className={this.state.addWebhookFieldClass}>
                                                <div className="asgard-field-label">
                                                    <input id="addWHHost" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="The Host URL for the Webhook. See documentation for expected URL structure.">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={this.state.addWebhookFieldClass}>
                                                <div className="d-flex">
                                                    <div>
                                                        <ul id="addWebhookStepNav" className="nav nav-tabs">
                                                            {this.state.addWebhookSteps.map((step, i) => (
                                                                (i+1) === this.state.addWebhookStepSelected ?
                                                                <li className="asgard-subtab active" key={`whSubTab_${i}`}>
                                                                    <a id={'addSubtabNav' + (i+1)} 
                                                                        data-toggle="tab" 
                                                                        href={step.href}
                                                                        onClick={this.clearActiveSubtab.bind(this)}>
                                                                        {step.text}
                                                                    </a>
                                                                    { i !== 0 ? 
                                                                        <i id={'add_Remove_Step' + (i+1)} 
                                                                            className="fas fa-times-circle pl-2 asgard-control asgard-help">
                                                                        </i>
                                                                        : 
                                                                        <div></div>
                                                                    }
                                                                </li>
                                                                :
                                                                <li className="asgard-subtab" key={`whSubTab_${i}`}>
                                                                    <a id={'addSubtabNav' + (i+1)}
                                                                        data-toggle="tab"
                                                                        href={step.href}
                                                                        onClick={this.clearActiveSubtab.bind(this)}>
                                                                        {step.text}
                                                                    </a>
                                                                    { i !== 0 ?
                                                                        <i id={'add_Remove_Step' + (i+1)}
                                                                            className="fas fa-times-circle pl-2 asgard-control asgard-help">
                                                                        </i>
                                                                        :
                                                                        <div></div>
                                                                    }
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="pl-2 my-auto">
                                                        {this.state.addWebhookSteps.length < 10 ?
                                                            <a id="addAddWebhookStep" title="Add a Webhook Step" onClick={this.addWebhookStep.bind(this)}>
                                                                <i className="fas fa-plus-square asgard-control asgard-help"></i>
                                                            </a>
                                                        :
                                                            <i className="fas fa-plus-square asgard-help disabled"></i>
                                                        }
                                                    </div>
                                                </div>
                                                <div id="addWebhookStepContent" className="tab-content pt-1">
                                                    <div id="add_Step_Container_1"></div>
                                                    <div id="add_Step_Container_2"></div>
                                                    <div id="add_Step_Container_3"></div>
                                                    <div id="add_Step_Container_4"></div>
                                                    <div id="add_Step_Container_5"></div>
                                                    <div id="add_Step_Container_6"></div>
                                                    <div id="add_Step_Container_7"></div>
                                                    <div id="add_Step_Container_8"></div>
                                                    <div id="add_Step_Container_9"></div>
                                                    <div id="add_Step_Container_10"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="asgard-multi-column-section align-bottom w-25">
                                        <div className="h-100 ml-auto mt-auto align-bottom">
                                            { this.state.addingDatasource ? (
                                                <button className={this.state.addDatasourceButtonClass} title="Add Datasource" onClick={this.add.bind(this)}>
                                                    <i className={this.state.addDatasourceIconClass}></i>
                                                </button>
                                            ) : (
                                                <button className="btn btn-dark asgard-button disabled" title="Add Datasource">
                                                    <i className="fas fa-save"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="editDatasources" className="tab-pane">
                                <div className="mb-auto asgard-multi-column-section w-30 align-top">
                                    <div className="col-12 scrollable-block asgard-multi-select-large list-group list-group-flush">
                                        {this.state.datasources.map(datasource => (
                                            <a
                                                key={datasource.name}
                                                id={"editItem_" + datasource.id}
                                                className={this.state.editDatasourceSelected === datasource.id ? 
                                                    "list-group-item py-1 list-group-action asgard-list-group-item asgard-list-group-item-selected"
                                                    : 
                                                    "list-group-item py-1 list-group-action asgard-list-group-item"
                                                }
                                                onClick={this.datasourceSelect.bind(this)}
                                            >
                                                {datasource.name}&nbsp;
                                                <i className={this.state.datasourceTypeIcons[datasource.type]}></i>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div className="asgard-multi-column-section w-70 asgard-multi-select-partner-large">
                                    <div className="w-100">
                                        {this.state.editDatasourceSelected !== -1 ? (
                                        <ul className="nav nav-tabs">
                                            <li className="asgard-details-tab active">
                                                <a data-toggle="tab" href="#datasourceDetails" onClick={this.selectSubtab.bind(this)}>Datasource Details</a>
                                            </li>
                                            <li className="asgard-details-tab">
                                                <a data-toggle="tab" href="#applyModels" onClick={this.selectSubtab.bind(this)}>Models &amp; Filters</a>
                                            </li>
                                        </ul>
                                        ) : (null)
                                        }
                                        <div className="tab-content pt-1">
                                            <div id="datasourceDetails" className="tab-pane active">
                                                <div className="asgard-multi-column-section w-100 asgard-multi-select-partner-large">
                                                    <div className={this.state.editDatasourceClass}>
                                                        <div>
                                                            <div className="d-flex flex-column">
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDatasourceName">Name&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex flex-column">
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editTypeDropdown">Type&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            {/*File field labels*/}
                                                            <div className={this.state.editFileFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDatasourceFile">File&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            {/*Database field labels*/}
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDBTypeDropdown">Type&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDBHostname">Host&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDBName">Database&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDBUsername">Username&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDBPassword">Password&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editDBTable">Table&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            {/* Webhook labels*/}
                                                            <div className={this.state.editWebhookFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editWHHost">Host&nbsp;</label>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editWebhookFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <label htmlFor="editWebhookStepNav">Steps&nbsp;</label>
                                                                </div>
                                                            </div>  
                                                        </div>
                                                        <div className="w-100">
                                                            <div className="d-flex flex-column">
                                                                <div className="asgard-field-label">
                                                                    <input id="editDatasourceName" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                                                    &nbsp;
                                                                    <a title="A user-defined, unique name for the Datasource e.g. Internet Text, Crime scene images">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex flex-column">
                                                                <div className="asgard-field-label d-flex">
                                                                    <TextDropdown id="editTypeDropdown"
                                                                                label="Datasource Type"
                                                                                options={this.state.typeOptions} 
                                                                                selectedOption={this.state.editSelectedOption}
                                                                                disabled={true}
                                                                                callback={this.typeSelectionCallback.bind(this)}/>
                                                                    &nbsp;
                                                                    <a title="Select the Datasource type. See the documentation for more information.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            {/*File field inputs*/}
                                                            <div className={this.state.editFileFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <input id="editDatasourceFile" className="input-sm" type="file" onChange={this.updateFileList.bind(this)}/>
                                                                    &nbsp;
                                                                    <a title="Update the datasource archive file containing text and image data.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            {/*Database field inputs*/}
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label d-flex">
                                                                    <TextDropdown id="editDBTypeDropdown"
                                                                                label="Database Type"
                                                                                options={this.state.dbOptions} 
                                                                                selectedOption={this.state.editSelectedDBOption}
                                                                                callback={this.dbTypeSelectionCallback.bind(this)}/>
                                                                    &nbsp;
                                                                    <a title="Select the Database type.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <input id="editDBHostname" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                                                    &nbsp;
                                                                    <a title="The FQDN of the DB server e.g. database.domain.com">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <input id="editDBName" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                                                    &nbsp;
                                                                    <a title="The name of the database hosted on the DB server that will be used.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <input id="editDBUsername" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                                                    &nbsp;
                                                                    <a title="The DB username that will be used to query text and image information.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <input id="editDBPassword" className="input-sm" onChange={this.updateEditFields.bind(this)} type="password"/>
                                                                    &nbsp;
                                                                    <a title="The password for the DB username that will be used to query text and image information.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editDBFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <input id="editDBTable" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                                                    &nbsp;
                                                                    <a title="The DB Table to be queried. See documentation for expected table structure.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            {/*Webhook field inputs*/}
                                                            <div className={this.state.editWebhookFieldClass}>
                                                                <div className="asgard-field-label">
                                                                    <input id="editWHHost" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                                                    &nbsp;
                                                                    <a title="The Host URL for the Webhook. See documentation for expected URL structure.">
                                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className={this.state.editWebhookFieldClass}>
                                                                <div className="d-flex">
                                                                    <div>
                                                                        <ul id="editWebhookStepNav" className="nav nav-tabs">
                                                                            {this.state.editWebhookSteps.map((step, i) => (
                                                                                (i+1) === this.state.editWebhookStepSelected ?
                                                                                <li className="asgard-subtab active">
                                                                                    <a id={'editSubtabNav' + (i+1)} 
                                                                                        data-toggle="tab" 
                                                                                        href={step.href}
                                                                                        onClick={this.clearActiveSubtab.bind(this)}>
                                                                                        {step.text}
                                                                                    </a>
                                                                                    { i !== 0 ? 
                                                                                        <i id={'edit_Remove_Step' + (i+1)} 
                                                                                            className="fas fa-times-circle pl-2 asgard-control asgard-help">
                                                                                        </i>
                                                                                        : 
                                                                                        <div></div>
                                                                                    }
                                                                                </li>
                                                                                :
                                                                                <li className="asgard-subtab">
                                                                                    <a id={'editSubtabNav' + (i+1)}
                                                                                        data-toggle="tab"
                                                                                        href={step.href}
                                                                                        onClick={this.clearActiveSubtab.bind(this)}>
                                                                                        {step.text}
                                                                                    </a>
                                                                                    { i !== 0 ?
                                                                                        <i id={'edit_Remove_Step' + (i+1)}
                                                                                            className="fas fa-times-circle pl-2 asgard-control asgard-help">
                                                                                        </i>
                                                                                        :
                                                                                        <div></div>
                                                                                    }
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="pl-2 my-auto">
                                                                        {this.state.editWebhookSteps.length < 10 ?
                                                                            <a id="editAddWebhookStep" title="Add a Webhook Step" onClick={this.addWebhookStep.bind(this)}>
                                                                                <i className="fas fa-plus-square asgard-control asgard-help"></i>
                                                                            </a>
                                                                        :
                                                                            <i className="fas fa-plus-square asgard-help disabled"></i>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div id="editWebhookStepContent" className="tab-content pt-1">
                                                                    <div id="edit_Step_Container_1"></div>
                                                                    <div id="edit_Step_Container_2"></div>
                                                                    <div id="edit_Step_Container_3"></div>
                                                                    <div id="edit_Step_Container_4"></div>
                                                                    <div id="edit_Step_Container_5"></div>
                                                                    <div id="edit_Step_Container_6"></div>
                                                                    <div id="edit_Step_Container_7"></div>
                                                                    <div id="edit_Step_Container_8"></div>
                                                                    <div id="edit_Step_Container_9"></div>
                                                                    <div id="edit_Step_Container_10"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    { this.state.editDatasourceSelected !== -1 ? (
                                                    <div className="h-100 align-bottom mt-auto ml-auto">
                                                        <div>
                                                            { this.state.editingDatasource ? (
                                                                <button className={this.state.editDatasourceButtonClass} title="Save Update" onClick={this.save.bind(this)}>
                                                                    <i className={this.state.editDatasourceIconClass}></i>
                                                                </button>
                                                            ) : (
                                                                <button className="btn btn-dark asgard-button disabled" title="Save Update">
                                                                    <i className="fas fa-save"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="pt-1">
                                                            { this.state.editDatasourceSelected !== -1 ? (
                                                                <button className={this.state.removeDatasourceButtonClass} title="Delete Datasource" onClick={this.remove.bind(this)}>
                                                                    <i className={this.state.removeDatasourceIconClass}></i>
                                                                </button> 
                                                            ) : (
                                                                <button className="btn btn-dark asgard-button disabled" title="Delete Datasource">
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    ) : (null)}
                                                </div>
                                            </div>
                                            <div id="applyModels" className="tab-pane">
                                                <div className="asgard-multi-column-section w-100 asgard-multi-select-partner-large">
                                                    <div>
                                                        <div className="col-12 scrollable-block asgard-multi-select-large list-group list-group-flush">
                                                            {this.state.models.map(model => (
                                                            <a
                                                                key={model.name}
                                                                id={"evntItem_" + model.id}
                                                                className={this.state.editModelSelected === model.id ? 
                                                                "list-group-item py-1 list-group-action asgard-list-group-item asgard-list-group-item-selected"
                                                                : 
                                                                "list-group-item py-1 list-group-action asgard-list-group-item"
                                                                }
                                                                onClick={this.modelSelect.bind(this)}
                                                            >
                                                                {model.name}&nbsp;
                                                                {this.state.icons.length ? (
                                                                this.state.icons.find(icon => icon.id === model.icon).type === 'font-awesome' ?
                                                                    <i className={this.state.icons.find(icon => icon.id === model.icon).location} id={"ivntItem_" + model.id}></i>
                                                                    :
                                                                    <img src={'/' + this.state.icons.find(icon => icon.id === model.icon).location} 
                                                                        alt="User defined icon"
                                                                        className="asgard-map-icon"/>
                                                                ) : (null)}
                                                            </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="input-form">
                                                        <label htmlFor="applyModelStartTime">Start Date&nbsp;</label>
                                                        <div className="asgard-field-label">
                                                            <input id="applyModelStartTime" className="input-sm" onChange={this.updateFilterFields.bind(this)} type="text"/>
                                                            &nbsp;
                                                            <a title="Specify a Start Date &amp; Time for an event filter">
                                                                <i className="fas fa-question-circle asgard-help"></i>
                                                            </a>
                                                        </div>

                                                        <label htmlFor="applyModelEndTime">End Date&nbsp;</label>
                                                        <div className="asgard-field-label">
                                                            <input id="applyModelEndTime" className="input-sm" onChange={this.updateFilterFields.bind(this)} type="text"/>
                                                            &nbsp;
                                                            <a title="Specify an End Date &amp; Time for an event filter">
                                                                <i className="fas fa-question-circle asgard-help"></i>
                                                            </a>
                                                        </div>

                                                        <label htmlFor="applyModelGPSLatitude">Latitude&nbsp;</label>
                                                        <div className="asgard-field-label">
                                                            <input id="applyModelGPSLatitude" className="input-sm" onChange={this.updateFilterFields.bind(this)} type="text"/>
                                                            &nbsp;
                                                            <a title="Specify a GPS Latitude for an event filter">
                                                                <i className="fas fa-question-circle asgard-help"></i>
                                                            </a>
                                                        </div>

                                                        <label htmlFor="applyModelGPSLongitude">Longitude&nbsp;</label>
                                                        <div className="asgard-field-label">
                                                            <input id="applyModelGPSLongitude" className="input-sm" onChange={this.updateFilterFields.bind(this)} type="text"/>
                                                            &nbsp;
                                                            <a title="Specify a GPS Longitude for an event filter">
                                                                <i className="fas fa-question-circle asgard-help"></i>
                                                            </a>
                                                        </div>

                                                        <label htmlFor="applyModelRadius">Radius&nbsp;</label>
                                                        <div className="asgard-field-label">
                                                            <input id="applyModelRadius" className="input-sm" onChange={this.updateFilterFields.bind(this)} type="text"/>
                                                            &nbsp;
                                                            <a title="Specify a Radius around the GPS filter">
                                                                <i className="fas fa-question-circle asgard-help"></i>
                                                            </a>
                                                        </div>

                                                        <label htmlFor="applyModelScore">Score&nbsp;</label>
                                                        <div className="asgard-field-label">
                                                            <input id="applyModelScore" className="input-sm" onChange={this.updateFilterFields.bind(this)} type="text"/>
                                                            &nbsp;
                                                            <a title="Filter by precision score - only results above this value will be returned">
                                                                <i className="fas fa-question-circle asgard-help"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="h-100 align-bottom mt-auto ml-auto">
                                                        { this.state.editModelSelected !== -1 ? (
                                                            <div className="mt-auto">
                                                                { this.state.editDatasourceSelected !== -1 &&
                                                                  this.state.editModelSelected !== -1 ? (
                                                                    <button className={this.state.applyModelsButtonClass} title="Apply Event Models" onClick={this.apply.bind(this)}>
                                                                        <i className={this.state.applyModelsIconClass}></i>
                                                                    </button> 
                                                                ) : (
                                                                    <button className="btn btn-dark asgard-button disabled" title="Apply Event Models">
                                                                        <i className="fas fa-play"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (null)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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

    reRegisterListeners() {
        // add params
        for (let i=0; i < this.state.addWebhookSteps.length; i++) {
            if (i > 0) {
                document.querySelector('#add_Remove_Step' + (i+1)).addEventListener('click', this.removeWebhookStep);
            }
        }
        for (let j=0; j < this.state.editWebhookSteps.length; j++) {
            if (j > 0) {
                document.querySelector('#edit_Remove_Step' + (j+1)).addEventListener('click', this.removeWebhookStep);
            }
        }
    }

    save() {
        if (!this.state.editInProgress) {
            if (this.state.editSelectedOption !== -1) {
                const dsType = this.state.typeOptions[this.state.editSelectedOption];
                const aDatasource = this.getDatasourceObject(dsType, 'edit');
                
                if (aDatasource !== null && this.validDatasource(aDatasource)) {
                    // retrieve the model object
                    let targetDatasource = this.state.datasources.find(x => x.id === this.state.editDatasourceSelected);
                    aDatasource.uuid = targetDatasource.uuid;
                    aDatasource.id = targetDatasource.id;

                    // set add in progress
                    this.toggleInProgress('edit');

                    if (dsType === 'File') {
                        this.saveDatasourceWithFile(aDatasource);
                    } else {
                        this.saveDatasource(aDatasource)
                            .then( res => {
                                // check for success
                                if (res.result === 'Success') {
                                    // refresh the cities list
                                    this.updateDatasourcesList();

                                    this.updateEditFields();
                                    /*this.setState({
                                        'editingDatasource': false,
                                    });*/
                                } else {
                                    console.log('There was a problem adding the new datasource: ' + res.error_message);
                                }
                                this.toggleInProgress('edit');
                            })
                            .catch( addErr => {
                                console.log(addErr);
                                this.toggleInProgress('edit');
                            });
                    }
                } else {
                    console.log('Validation of the Edit Datasource fields failed.');
                }
            } else {
                console.log('Datasource type not selected!');
            }
        } else {
            console.log('A new model is currently being saved. Please try again later!');
        }
    }

    saveDatasource = async(aDatasource) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/datasources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aDatasource),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;    
    }

    saveDatasourceWithFile(aDatasource) {
        //create a new FormData object to send the file
        let formData = new FormData();
        formData.append('type', 'datasource');
        formData.append('storageType', 'Filesystem');
        formData.append('name', aDatasource.name);
        formData.append('uuid', aDatasource.uuid);
        formData.append('file', this.state.editDatasourceFileList[0], this.state.editDatasourceFileList[0].name);
        // upload the training data first and then create the event model
        this.uploadData(formData, 'POST')
            .then( uploadRes => {
                // check that the data was uploaded successfully
                if (uploadRes.result === 'Success') {
                    // add the data path to the DS object
                    aDatasource.path = uploadRes.dataPath;

                    this.saveDatasource(aDatasource)
                        .then(addRes => {
                            if (addRes.result === 'Success') {
                                this.clearFileFields('edit');

                                // refresh the cities list
                                this.updateDatasourcesList();

                                this.setState({
                                    'editingDatasource': false,
                                    'editDatasourceFileList': [],
                                });

                                this.updateEditFields();
                            } else {
                                console.log('There was a problem adding the new datasource: ' + addRes.error_message);
                                // TODO: should delete the uploaded data
                            }
                            this.toggleInProgress('edit');
                        })
                        .catch(addDSErr => {
                            console.log(addDSErr);
                            // TODO: should delete the uploaded data
                            this.toggleInProgress('edit');
                        });
                } else {
                    console.log('There was a problem uploading the file associated with the File Datasource data: ' + uploadRes.error_message);
                    this.toggleInProgress('edit');
                }
            })
            .catch( err => {
                console.log(err);
                this.toggleInProgress('edit');
            });
    }

    selectTab(event) {
        let targetTab = event.target.innerText.substring(0,1) === 'C' ? 'createDatasources' : 'editDatasources';
        if(this.state.currentTab !== targetTab) { 
            // clear any previously selected
            const datasourcesManager = document.querySelector('#manageDatasources');
            let selectedElements = datasourcesManager.getElementsByClassName('asgard-tab');
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

    selectSubtab(event) {
        let targetTab = event.target.innerText.substring(0,1) === 'D' ? 'datasourceDetails' : 'applyModels';
        if(this.state.currentDetailstab !== targetTab) { 
            // clear any previously selected
            const datasourcesManager = document.querySelector('#manageDatasources');
            let selectedElements = datasourcesManager.getElementsByClassName('asgard-details-tab');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\bactive\b/g, "");
            });

            // set the target tab to active
            event.target.parentElement.className = event.target.parentElement.className + " active";
            
            // update currentTab state
            this.setState({
                'currentDetailsTab': targetTab,
            });
        }
    }

    setDBDatasourceFields(aDatasource) {
        const datasourceManager = document.querySelector('#manageDatasources');
        datasourceManager.querySelector('#editDatasourceName').value = aDatasource.name;
        datasourceManager.querySelector('#editDBHostname').value = aDatasource.host;
        datasourceManager.querySelector('#editDBName').value = aDatasource.db;
        datasourceManager.querySelector('#editDBUsername').value = aDatasource.username;
        datasourceManager.querySelector('#editDBPassword').value = aDatasource.password;
        datasourceManager.querySelector('#editDBTable').value = aDatasource.table;
        const selectedDBOption = this.state.dbOptions.indexOf(aDatasource.dbType);

        this.setState({
            'editSelectedOption': 1,
            'editSelectedDBOption': selectedDBOption,
            'editDBFieldClass': 'd-flex flex-column',
            'editFileFieldClass': 'disposed d-flex flex-column',
            'editWebhookFieldClass': 'disposed d-flex flex-column',
        });
    }

    setFileDatasourceFields(aDatasource) {
        const datasourceManager = document.querySelector('#manageDatasources');
        datasourceManager.querySelector('#editDatasourceName').value = aDatasource.name;
        datasourceManager.querySelector('#editDatasourceFile').value = '';
        this.setState({
            'editSelectedOption': 0,
            'editDBFieldClass': 'disposed d-flex flex-column',
            'editFileFieldClass': 'd-flex flex-column',
            'editWebhookFieldClass': 'disposed d-flex flex-column',
            'editDatasourceFileList': [],
        });
    }

    setWHDatasourceFields(aDatasource) {
        const datasourceManager = document.querySelector('#manageDatasources');
        datasourceManager.querySelector('#editDatasourceName').value = aDatasource.name;
        datasourceManager.querySelector('#editWHHost').value = aDatasource.host;

        let temp = [];
        let tempContents = [];

        for (let j=0; j < this.state.editWebhookStepContents.length; j++) {
            ReactDOM.unmountComponentAtNode(document.querySelector('#edit_Step_Container_' + (j+1)));
        }

        for (let i=0; i < aDatasource.steps.length; i++) {
            let step = i+1;
            const newStep = {
                href: '#step' + step,
                text: 'Step ' + step
            };
            
            let newContent = {
                id: 'edit_' + step,
                requestParams: aDatasource.steps[i].request,
                responseParams: aDatasource.steps[i].response,
                responseHandledByEndpoint: aDatasource.steps[i].responseHandledByEndpoint,
                stepStageActive: 'Request'
            };
            
            temp.push(newStep);
            tempContents.push(newContent);
            ReactDOM.render(
                <WebhookStep id={newContent.id}
                                requestParams={newContent.requestParams}
                                responseParams={newContent.responseParams}
                                responseHandledByEndpoint={newContent.responseHandledByEndpoint}
                                stepStageActive={newContent.stepStageActive}
                                updateCallback={this.updateWebhookStep.bind(this)}
                                active={1}/>, 
                document.querySelector('#edit_Step_Container_' + step)
            );
            newContent = null;
        }

        this.setState({
            'editSelectedOption': 2,
            'editWebhookSteps': temp,
            'editWebhookStepContents': tempContents,
            'editDBFieldClass': 'disposed d-flex flex-column',
            'editFileFieldClass': 'disposed d-flex flex-column',
            'editWebhookFieldClass': 'd-flex flex-column',
        });
    }

    static getDerivedStateFromError(error) {
        console.log('Datasources.GetDerivedStateFromError:');
        console.log(error);
    }

    toggleInProgress(prefix) {
        if (prefix === 'add') {
            this.setState({
                'addingInProgress': !this.state.addingInProgress,
                'addDatasourceButtonClass': this.state.addingInProgress ? 'btn btn-dark asgard-button' : 'btn btn-dark asgard-button disabled',
                'addDatasourceIconClass': this.state.addingInProgress ? 'fas fa-save' : 'fas fa-sync-alt fa-spin',
            });
        } else {
            this.setState({
                'editInProgress': !this.state.editInProgress,
                'editDatasourceButtonClass': this.state.editInProgress ? 'btn btn-dark asgard-button' : 'btn btn-dark asgard-button disabled',
                'editDatasourceIconClass': this.state.editInProgress ? 'fas fa-save' : 'fas fa-sync-alt fa-spin',
            });
        }
    }

    toggleRemoveInProgress() {
        this.setState({
            'removeInProgress': !this.state.removeInProgress,
            'removeDatasourceButtonClass': this.state.removeInProgress ? 'btn btn-dark asgard-button' : 'btn btn-dark asgard-button disabled',
            'removeDatasourceIconClass': this.state.removeInProgress ? 'fas fa-trash-alt' : 'fas fa-sync-alt fa-spin',
        });
    }

    typeSelectionCallback(target, anId) {
        if (target.substring(0,3) === 'add') {
            if (target.indexOf('FieldCheck') !== -1) {
                this.updateAddFields();
            } else {
                this.setState({
                    'addSelectedOption': anId,
                });
                this.updateSelectedFieldClasses(target, anId);
                this.clearDatasourceTypeFields(target, anId);
            }
        } else {
            if (target.indexOf('FieldCheck') !== -1) {
                this.updateEditFields();
            } else {
                this.setState({
                    'editSelectedOption': anId,
                });
                this.updateSelectedFieldClasses(target, anId);
                this.clearDatasourceTypeFields(target, anId);
            }
        }    
    }

    updateAddFields() {
        // retrieve the current values
        const datasourceManager = document.querySelector('#manageDatasources');
        let name = datasourceManager.querySelector('#addDatasourceName').value;

        if (this.validString(name) && this.state.addSelectedOption !== -1) {
            if (this.state.addSelectedOption === 0) {
                const dsFile = datasourceManager.querySelector('#addDatasourceFile').value;
                if (this.state.addDatasourceFileList.length || this.validString(dsFile)) {
                    if (!this.state.addingDatasource) {
                        this.setState({"addingDatasource": true});
                    }
                } else {
                    if (this.state.addingDatasource) {
                        this.setState({"addingDatasource": false});
                    }
                }
            } else if (this.state.addSelectedOption === 1) {
                const aDatasource = this.getDatasourceObject('Database', 'add');
                if (this.state.addSelectedDBOption !== -1 && this.validString(aDatasource.host) 
                        && this.validString(aDatasource.db) && this.validString(aDatasource.username) 
                        && this.validString(aDatasource.password) && this.validString(aDatasource.table)) {
                    if (!this.state.addingDatasource) {
                        this.setState({"addingDatasource": true});
                    }
                } else {
                    if (this.state.addingDatasource) {
                        this.setState({"addingDatasource": false});
                    }
                }
            } else if (this.state.addSelectedOption === 2) {
                let aDatasource = this.getDatasourceObject('Webhook', 'add');
                if (this.validDatasource(aDatasource)) {
                    if (!this.state.addingDatasource) {
                        this.setState({"addingDatasource": true});
                    }
                } else {
                    if (this.state.addingDatasource) {
                        this.setState({"addingDatasource": false});
                    }
                }
            }
        } else {
            if (this.state.addingDatasource) {
                this.setState({"addingDatasource": false});
            }
        }
    }

    updateDatasources = function(newDatasources, onUpdateState) {
        let temp = newDatasources;
        temp.sort(this.datasourceCompare);
        this.setState({
            'datasources': temp,
        }, onUpdateState);
    }

    updateDatasourcesList() {
        this.getDatasources()
            .then(res => {
                this.updateDatasources(res.result);
            })
            .catch(err => console.log(err));
    }

    updateEditFields() {
        // retrieve the current values
        const datasourceManager = document.querySelector('#manageDatasources');
        let name = datasourceManager.querySelector('#editDatasourceName').value;

        const targetDatasource = this.state.datasources.find(x => x.id === this.state.editDatasourceSelected);

        if (this.validString(name) && this.state.editSelectedOption !== -1) {
            if (this.state.editSelectedOption === 0) {
                const dsFile = datasourceManager.querySelector('#editDatasourceFile').value;
                if (targetDatasource.name !== name || this.state.editDatasourceFileList.length || this.validString(dsFile)) {
                    if (!this.state.editingDatasource) {
                        this.setState({"editingDatasource": true});
                    }
                } else {
                    if (this.state.editingDatasource) {
                        this.setState({"editingDatasource": false});
                    }
                }
            } else if (this.state.editSelectedOption === 1) {
                const aDatasource = this.getDBDatasourceObject('edit');
                const validParams = this.validString(aDatasource.host) && this.validString(aDatasource.db) 
                                    && this.validString(aDatasource.username) && this.validString(aDatasource.password) 
                                    && this.validString(aDatasource.table) && this.state.editSelectedDBOption !== -1;

                if (validParams && (targetDatasource.name !== aDatasource.name || targetDatasource.host !== aDatasource.host 
                                    || targetDatasource.db !== aDatasource.db || targetDatasource.username !== aDatasource.username 
                                    || targetDatasource.password !== aDatasource.password || targetDatasource.table !== aDatasource.table
                                    || targetDatasource.dbType !== aDatasource.dbType)) {
                    if (!this.state.editingDatasource) {
                        this.setState({"editingDatasource": true});
                    }
                } else {
                    if (this.state.editingDatasource) {
                        this.setState({"editingDatasource": false});
                    }
                }
            } else if (this.state.editSelectedOption === 2) {
                let aDatasource = this.getDatasourceObject('Webhook', 'edit');
                if (this.validDatasource(aDatasource) && !this.compareWebhookDatasources(targetDatasource, aDatasource)) {
                    if (!this.state.editingDatasource) {
                        this.setState({"editingDatasource": true});
                    }
                } else {
                    if (this.state.editingDatasource) {
                        this.setState({"editingDatasource": false});
                    }
                }
            }
        } else {
            if (this.state.editingDatasource) {
                this.setState({"editingDatasource": false});
            }
        }
    }

    updateFileList(event) {
        let targetFileInput = event.target.id.substring(0,3);

        if (targetFileInput === 'add') {
            this.setState({
                'addDatasourceFileList': event.target.files,
            });
            this.updateAddFields();
        } else if (targetFileInput === 'edi') {
            this.setState({
                'editDatasourceFileList': event.target.files,
                'editingDatasource': true,
            });
            this.updateEditFields();
        }

    }

    updateFilterFields() {

    }

    updateIcons = function(newIcons) {
        this.setState({
            icons: newIcons,
        });
    }

    updateIconsList() {
        getIcons()
            .then(res => {
                this.updateIcons(res.result);
            })
            .catch(err => console.log('An execption occurred: '+ err));
    }

    updateModels = function(newModels) {
        let temp = newModels.filter(function (model){
            return model.status === 'Trained';
        });
        temp.sort(modelCompare);
        this.setState({
            models: temp,
        });
    }

    updateModelsList() {
        getModels()
            .then(res => {
                this.updateModels(res.result);
            })
            .catch(err => console.log('An execption occurred: '+ err));
    }

    updateSelectedFieldClasses(target, anId) {
        if (target.substring(0,3) === 'add') {
            switch(anId) {
                case 0: // file type
                    this.setState({
                        'addFileFieldClass': 'd-flex flex-column',
                        'addDBFieldClass': 'disposed d-flex flex-column',
                        'addWebhookFieldClass': 'disposed d-flex flex-column',
                    });
                    break;
                case 1: // database type
                    this.setState({
                        'addFileFieldClass': 'disposed d-flex flex-column',
                        'addDBFieldClass': 'd-flex flex-column',
                        'addWebhookFieldClass': 'disposed d-flex flex-column',
                    });
                    break;
                case 2: // webhook type
                    this.setState({
                        'addFileFieldClass': 'disposed d-flex flex-column',
                        'addDBFieldClass': 'disposed d-flex flex-column',
                        'addWebhookFieldClass': 'd-flex flex-column',
                    });
                    break;
                default:
                    this.setState({
                        'addFileFieldClass': 'disposed d-flex flex-column',
                        'addDBFieldClass': 'disposed d-flex flex-column',
                        'addWebhookFieldClass': 'disposed d-flex flex-column', 
                    });
                    break;
            }
        } else {
            switch(anId) {
                case 0: // file type
                    this.setState({
                        'editFileFieldClass': 'd-flex flex-column',
                        'editDBFieldClass': 'disposed d-flex flex-column',
                        'editWebhookFieldClass': 'disposed d-flex flex-column',
                    });
                    break;
                case 1: // database type
                    this.setState({
                        'editFileFieldClass': 'disposed d-flex flex-column',
                        'editDBFieldClass': 'd-flex flex-column',
                        'editWebhookFieldClass': 'disposed d-flex flex-column',
                    });
                    break;
                case 2: // webhook type
                    this.setState({
                        'editFileFieldClass': 'disposed d-flex flex-column',
                        'editDBFieldClass': 'disposed d-flex flex-column',
                        'editWebhookFieldClass': 'd-flex flex-column',
                    });
                    break;
                default:
                    this.setState({
                        'editFileFieldClass': 'disposed d-flex flex-column',
                        'editDBFieldClass': 'disposed d-flex flex-column',
                        'editWebhookFieldClass': 'disposed d-flex flex-column',
                    });
                    break;
            }
        }
    }

    updateWebhookStep(id, requestParams, responseParams, responseHandledByEndpoint, stepStageActive) {
        const prefix = id.substring(0, id.indexOf('_'));
        const targetIndex = parseInt(id.substring(id.indexOf('_')+1), 10);
        let tempContents = [];
        if (prefix === 'add') {
            tempContents = this.state.addWebhookStepContents.slice(0);
            tempContents[targetIndex-1].requestParams = requestParams;
            tempContents[targetIndex-1].responseParams = responseParams;
            tempContents[targetIndex-1].responseHandledByEndpoint = responseHandledByEndpoint;
            tempContents[targetIndex-1].stepStageActive = stepStageActive;

            this.setState({
                'addWebhookStepContents': tempContents,
            });

            this.updateAddFields();
        } else {
            tempContents = this.state.editWebhookStepContents.slice(0);
            tempContents[targetIndex-1].requestParams = requestParams;
            tempContents[targetIndex-1].responseParams = responseParams;
            tempContents[targetIndex-1].responseHandledByEndpoint = responseHandledByEndpoint;
            tempContents[targetIndex-1].stepStageActive = stepStageActive;

            this.setState({
                'editWebhookStepContents': tempContents,
            });

            this.updateEditFields();
        }
    }

    uploadData = async(formData, aMethod) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/data', {
            method: aMethod,
            headers: {
                'enctype': 'multipart/form-data',
                'Accept': 'application/json',
            },
            body: formData,
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;    
    }

    validDatasource(aDatasource) {
        let valid = false;
        if (aDatasource !== null) {
            let validNameAndType = this.validString(aDatasource.name) && this.validString(aDatasource.type);
            switch(aDatasource.type) {
                case 'File':
                    valid = validNameAndType && this.validString(aDatasource.filename);
                    break;

                case 'Database':
                    valid = validNameAndType && this.validString(aDatasource.dbType) 
                            && this.validString(aDatasource.host) && this.validString(aDatasource.db)
                            && this.validString(aDatasource.username) && this.validString(aDatasource.password)
                            && this.validString(aDatasource.table); 
                    break;

                case 'Webhook':
                    if (validNameAndType && aDatasource.steps.length) {
                        let validWHParams = this.validString(aDatasource.host);
                        for (let i=0; i < aDatasource.steps.length; i++) {
                            validWHParams = validWHParams && aDatasource.steps[i].request.length
                                            && aDatasource.steps[i].response.length;
                            if (validWHParams) {
                                const reqs = aDatasource.steps[i].request; 
                                for (let j=0; j < reqs.length; j++) {
                                    validWHParams = validWHParams && this.validString(reqs[j].param) 
                                                                    && (this.validString(reqs[j].paramValue || reqs[j].linkedParam));
                                }
                                if (validWHParams) {
                                    const resps = aDatasource.steps[i].response;
                                    for (let k=0; k < resps.length; k++) {
                                        validWHParams = validWHParams && this.validString(resps[k].param);
                                    }
                                } else {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }
                        valid = validWHParams;
                    }
                    break;

                default:
                    break;
            }
        }

        return valid;
    }

    validString(aString) {
        return aString && aString !== '' && (/\S/g).test(aString);
    }
}

export default Datasources;