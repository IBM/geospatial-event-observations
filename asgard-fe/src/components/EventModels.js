/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

import Checkbox from './Checkbox';
import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';
import { getIcons } from '../services/icons';
import IconPicker from './IconPicker';
import TextDropdown from './TextDropdown';

class EventModels extends Component {
    state = {
        models: [],
        addingModel: false,
        addingInProgress: false,
        addIconSelected: -1,
        addModelButtonClass: 'btn btn-dark asgard-button',
        addModelFileList: [],
        addModelIconClass: 'fas fa-save',
        addSelectedSevOption: -1,
        addTrainModel: true,
        cancelModelTrainingButtonClass: 'btn btn-dark asgard-button',
        cancelModelTrainingIconClass: 'fas fa-ban',
        editModelClass: 'disposed asgard-multi-column-section w-80 px-2',
        editModelSelected: -1,
        editingModel: false,
        editInProgress: false,
        editModelButtonClass: 'btn btn-dark asgard-button',
        editModelFileList: [],
        editIconSelected: -1,
        editModelIconClass: 'fas fa-save',
        editSelectedSevOption: -1,
        editTrainModel: false,
        icons: [],
        removeInProgress: false,
        removeModelButtonClass: 'btn btn-dark asgard-button',
        removeModelIconClass: 'fas fa-trash-alt',
        icon: 'default',
        editIcon: 'default',
        currentTab: 'create',
        sevOptions: ['Highest',
                        'High',
                        'Medium',
                        'Low',
                        'Lowest'],
        modelStatuses: [
            {
                status: "Created",
                icon: "fas fa-subway",
                description: "Model can be Trained"
            },
            {
                status: "Training",
                icon: "fas fa-sync-alt fa-spin",
                description: "Training in Progress"
            },
            {
                status: "Trained",
                icon: "fas fa-certificate",
                description: "Ready to Use"
            }
        ],
    };

    constructor(props) {
        super(props);

        this.add = this.add.bind(this);
        this.cancelModelTraining = this.cancelModelTraining.bind(this);
        this.clearTrainingDataFields = this.clearTrainingDataFields.bind(this);
        this.resetOnError = this.resetOnError.bind(this);
        this.updateModelsList = this.updateModelsList.bind(this);
        this.updateIconsList = this.updateIconsList.bind(this);

        this.updateModelsList();
        this.updateIconsList();
    }
    
    componentDidMount() {
        //this.updateModelsList();
        //this.updateIconsList();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.modelsUpdate !== this.props.modelsUpdate) {
            console.log('We need to update the Models List!');
            this.updateModelsList();
            this.updateIconsList();
        }
    }
    
    add() {
        if (!this.state.addingInProgress) {
            const eventModelManager = document.querySelector('#manageEventModels');
            let name = eventModelManager.querySelector('#addModelName').value;
            // let timeFrame = eventModelManager.querySelector('#addModelTimeFrame').value;
            // let area = eventModelManager.querySelector('#addModelArea').value;
            // let keyword = eventModelManager.querySelector('#addModelKeyword').value;
            if (this.validString(name) // && this.validString(timeFrame) && this.validString(area)
                // && this.validString(keyword) 
                && this.state.addModelFileList.length
                && this.validString(this.state.addModelFileList[0].name) && this.state.addIconSelected !== -1
                && this.state.addSelectedSevOption !== -1) {
                this.setState({
                    'addingInProgress': true,
                    'addModelButtonClass': 'btn btn-dark asgard-button disabled',
                    'addModelIconClass': 'fas fa-sync-alt fa-spin',
                });

                //create a new FormData object to send the file
                let formData = new FormData();
                formData.append('type', 'training');
                formData.append('storageType', 'Filesystem');
                formData.append('name', name);
                formData.append('file', this.state.addModelFileList[0], this.state.addModelFileList[0].name);
                // upload the training data first and then create the event model
                this.uploadData(formData)
                    .then( uploadRes => {
                        // check that the data was uploaded successfully
                        if (uploadRes.result === 'Success') {
                            let aModel = {
                                'id': -1,
                                'name': name,
                                'trainingDataPath': uploadRes.dataPath,
                                // 'timeFrame': timeFrame,
                                // 'area': area,
                                // 'keyword': keyword,
                                'severity': this.state.addSelectedSevOption,
                                'icon': this.state.addIconSelected,
                                'trainModel': this.state.addTrainModel
                            };

                            this.addModel(aModel)
                                .then( res => {
                                    // check for success
                                    if (res.result === 'Success') {
                                        // clear the create fields
                                        this.clearFields('add');

                                        // refresh the cities list
                                        this.updateModelsList();
                                    } else {
                                        console.log('There was a problem adding the new model: ' + res.error_message);
                                    }
                                    this.setState({
                                        'addingModel': false,
                                        'addingInProgress': false,
                                        'addModelButtonClass': 'btn btn-dark asgard-button',
                                        'addModelIconClass': 'fas fa-save',
                                        'addTrainModel': true,
                                    });
                                })
                                .catch( addErr => {
                                    this.resetOnError('add', addErr);
                                });
                        } else {
                            this.resetOnError('add', 'There was a problem uploading the data: ' + uploadRes.error_message);
                        }
                    })
                    .catch( err => {
                        this.resetOnError('add', err);
                    });
            } else {
                console.log('Create field validation failed.');
            }
        } else {
            console.log('A new model is currently being added. Please try again later!');
        }
    }

    addModel = async(aModel) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/models', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aModel),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;    
    }

    open() {
        
    }

    cancelModelTraining() {
        if (!this.state.editInProgress) {
            const targetModel = this.state.models.find(x => x.id === this.state.editModelSelected);
            if (this.state.editModelSelected !== -1 && targetModel.status === 'Training') {
                let updatedModel = {
                    'id': this.state.editModelSelected,
                    'name': targetModel.name,
                    'trainingDataPath': targetModel.trainingDataPath,
                    'severity': this.state.editSelectedSevOption,
                    'icon': this.state.editIconSelected,
                    'trainModel': this.state.editTrainModel,
                    'cancelTraining': true
                };

                // update the edit button to indicate progress
                this.setState({
                    'editInProgress': true,
                    'cancelModelTrainingButtonClass': 'btn btn-dark asgard-button disabled',
                    'cancelModelTrainingIconClass': 'fas fa-sync-alt fa-spin',
                });

                this.saveModel(updatedModel)
                    .then(res => {
                        if (res.result === 'Success') {
                            this.getModels()
                                .then(modelsRes => {
                                    this.updateModels(modelsRes.result);

                                    this.setState({
                                        'editInProgress': false,
                                        'cancelModelTrainingButtonClass': 'btn btn-dark asgard-button',
                                        'cancelModelTrainingIconClass': 'fas fa-ban',
                                    });
                                })
                                .catch(modelsErr => console.log(modelsErr));
                        } else {
                            this.resetOnError('edit', 'There was a problem updating the selected model:' + res.error_message);
                        }
                    })
                    .catch(err => {
                        this.resetOnError('edit', err);
                    });
            } else {
                console.log('Model state validation failed.');
            }
        } else {
            console.log('A model is currently being updated. Please try again later!');
        }
    }

    clearFields(idPrefix) {
        const eventModelManager = document.querySelector('#manageEventModels');
        eventModelManager.querySelector('#' + idPrefix + 'ModelName').value = '';
        eventModelManager.querySelector('#' + idPrefix + 'ModelTrainingData').value = '';
        // eventModelManager.querySelector('#' + idPrefix + 'ModelTimeFrame').value = '';
        // eventModelManager.querySelector('#' + idPrefix + 'ModelArea').value = '';
        // eventModelManager.querySelector('#' + idPrefix + 'ModelKeyword').value = '';
        if (idPrefix === 'add') {
            this.setState({
                'addSelectedSevOption': -1,
                'addIconSelected': -1,
            });
        } else {
            this.setState({
                'editSelectedSevOption': -1,
                'editIconSelected': -1,
            });
        }
    }

    clearTrainingDataFields(idPrefix) {
        const eventModelManager = document.querySelector('#manageEventModels');
        eventModelManager.querySelector('#' + idPrefix + 'ModelTrainingData').value = '';
    }

    close() {
        this.props.callbackFromApp();
    }

    componentDidCatch(error, info) {
        console.log('ComponentDidCatch:');
        console.log(error);
        console.log(info);
    }

    createIconPickerSelectionCallback(anIcon) {
        this.setState({
            'addIconSelected': anIcon.id,
        }, this.updateAddFields);
    }

    editIconPickerSelectionCallback(anIcon) {
        this.setState({
            'editIconSelected': anIcon.id,
            'editingModel': true,
        });
    }

    getModels = async() => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/models');
        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    iconPickerIconsCallback(icons) {
        this.setState({
            'icons': icons,
        });
    }

    modelCompare(a,b) {
        let modelA = a.name.toUpperCase();
        let modelB = b.name.toUpperCase();
        if (modelA > modelB) {
            return 1;
        }
        if (modelA < modelB) {
            return -1;
        }
        return 0;    
    }

    modelSelect(event) {
        let elementId = (event.target.id).toString();
        let modelId = parseInt(elementId.substring(9), 10);
        if (this.state.editModelSelected !== modelId) {
            // clear any previously selected
            const eventModelManager = document.querySelector('#manageEventModels');
            let selectedElements = eventModelManager.getElementsByClassName('asgard-list-group-item-selected');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\b asgard-list-group-item-selected\b/g, "");
            });
            
            // retrieve the model object
            let targetModel = this.state.models.find(x => x.id === modelId);

            if (elementId.substring(0,1) === 'e') {
                event.target.className = event.target.className + " asgard-list-group-item-selected";
            } else if (elementId.substring(0,1) === 'i') {
                event.target.parentElement.className = event.target.parentElement.className + " asgard-list-group-item-selected";
            }

            // set the model name
            eventModelManager.querySelector('#editModelName').value = targetModel.name;
            // reset the training data
            eventModelManager.querySelector('#editModelTrainingData').value ='';
            // set the time frame
            // eventModelManager.querySelector('#editModelTimeFrame').value = targetModel.timeFrame;
            // set the area
            // eventModelManager.querySelector('#editModelArea').value = targetModel.area;
            // set the keyword
            // eventModelManager.querySelector('#editModelKeyword').value = targetModel.keyword;

            // set the item as selected
            // make the edit fields visible and set the icon
            // if a model has just been selected it is not being edited yet - disable editing
            this.setState({
                'editModelSelected': modelId,
                'editModelClass': 'asgard-multi-column-section w-80 px-2',
                'editSelectedSevOption': targetModel.severity,
                'editIconSelected': targetModel.icon,
                'editingModel': false,
                'editTrainModel': false,
            });
        }
    }

    remove() {
        if (!this.state.removeInProgress) {
            if (this.state.editModelSelected !== -1) {
                // update the remove button to indicate progress
                this.setState({
                    'removeInProgress': true,
                    'removeModelButtonClass': 'btn btn-dark asgard-button disabled',
                    'removeModelIconClass': 'fas fa-sync-alt fa-spin',
                });

                let target = this.state.models.find(x => x.id === this.state.editModelSelected);
                this.removeModel(target)
                    .then( res => {
                        // check for success
                        if (res.result === 'Success') {
                            // clear and hide the edit fields
                            this.clearFields('edit');
                            this.setState({
                                'editModelClass': 'disposed asgard-multi-column-section w-80 px-2',
                                'editModelSelected': -1,
                            });

                            // refresh the cities list
                            this.updateModelsList();
                        } else {
                            console.log('There was a problem deleting the selected model: ' + res.error_message);
                        }
                        this.setState({
                            'removeInProgress': false,
                            'removeModelButtonClass': 'btn btn-dark asgard-button',
                            'removeModelIconClass': 'fas fa-trash-alt',
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        this.setState({
                            'removeInProgress': false,
                            'removeModelButtonClass': 'btn btn-dark asgard-button',
                            'removeModelIconClass': 'fas fa-trash-alt',
                        });
                    });
            }
        } else {
            console.log('A model is currently being deleted. Please try again later!');
        }
    }

    removeModel = async(aModel) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/models', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aModel),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    resetOnError(prefix, message) {
        console.log(message);
        if (prefix === 'add') {
            this.setState({
                'addingInProgress': false,
                'addModelButtonClass': 'btn btn-dark asgard-button',
                'addModelIconClass': 'fas fa-save',
            });
        } else {
            this.setState({
                'editInProgress': false,
                'editModelButtonClass': 'btn btn-dark asgard-button',
                'editModelIconClass': 'fas fa-save',
            });
        }
    }

    save(event) {
        if (!this.state.editInProgress) {
            const targetModel = this.state.models.find(x => x.id === this.state.editModelSelected);

            if ((this.state.editModelSelected !== -1 && this.state.editingModel)
                || (this.state.editModelSelected !== -1 && targetModel.status === 'Created' && this.state.editTrainModel)) {
                // retrieve the update values
                const eventModelManager = document.querySelector('#manageEventModels');
                let name = eventModelManager.querySelector('#editModelName').value;

                // get uuid for update
                let uuid = targetModel.trainingDataPath.split('/');
                uuid = uuid[uuid.length-1];

                // update the edit button to indicate progress
                this.setState({
                    'editInProgress': true,
                    'editModelButtonClass': 'btn btn-dark asgard-button disabled',
                    'editModelIconClass': 'fas fa-sync-alt fa-spin',
                });

                //create a new FormData object to send the file
                let formData = undefined;
                if (this.state.editModelFileList[0] !== undefined) {
                    formData = new FormData();
                    formData.append('type', 'training');
                    formData.append('storageType', 'Filesystem');
                    formData.append('name', name);
                    formData.append('uuid', uuid);
                    formData.append('file', this.state.editModelFileList[0], this.state.editModelFileList[0].name);
                }
                
                this.uploadData(formData)
                    .then(uploadRes => {
                        if (uploadRes.result === 'Success') {
                            let updatedModel = {
                                'id': this.state.editModelSelected,
                                'name': name,
                                'trainingDataPath': targetModel.trainingDataPath,
                                'severity': this.state.editSelectedSevOption,
                                'icon': this.state.editIconSelected,
                                'trainModel': this.state.editTrainModel
                            };

                            this.saveModel(updatedModel)
                                .then(res => {
                                if (res.result === 'Success') {
                                    this.getModels()
                                        .then(modelsRes => {
                                            this.updateModels(modelsRes.result);

                                            this.setState({
                                                'editingModel': false,
                                                'editInProgress': false,
                                                'editModelButtonClass': 'btn btn-dark asgard-button',
                                                'editModelIconClass': 'fas fa-save',
                                                'editTrainModel': false,
                                            });

                                            this.clearTrainingDataFields('edit');
                                        })
                                        .catch(modelsErr => console.log(modelsErr));
                                } else {
                                    this.resetOnError('edit', 'There was a problem updating the selected model:' + res.error_message);
                                }
                            })
                            .catch(err => {
                                this.resetOnError('edit', err);
                            });
                        } else {
                            this.resetOnError('edit', 'There was a problem updating the selected model:' + uploadRes.error_message);
                        }
                    })
                    .catch(uploadErr => {
                        this.resetOnError('edit', uploadErr);
                    });
            } else {
                console.log('Edit field validation failed.');
            }
        } else {
            console.log('A model is currently being updated. Please try again later!');
        }
    }

    saveModel = async(aModel) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/models', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aModel),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    selectTab(event) {
        let targetTab = event.target.innerText.substring(0,1) === 'C' ? 'create' : 'edit';
        if(this.state.currentTab !== targetTab) { 
            // clear any previously selected
            const eventModelManager = document.querySelector('#manageEventModels');
            let selectedElements = eventModelManager.getElementsByClassName('asgard-tab');
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

    sevSelectionCallback(target, anId) {
        if (target.substring(0,3) === 'add') {
            if (target.indexOf('FieldCheck') !== -1) {
                this.updateAddFields();
            } else {
                this.setState({
                    'addSelectedSevOption': anId,
                });
            }
        } else {
            if (target.indexOf('FieldCheck') !== -1) {
                this.updateEditFields();
            } else {
                this.setState({
                    'editSelectedSevOption': anId,
                });
            }
        }
    }

    static getDerivedStateFromError(error) {
        console.log('EventModels.GetDerivedStateFromError:');
        console.log(error);
    }

    trainModel() {
        this.setState({
            addTrainModel: !this.state.addTrainModel,
        });
    }

    updateAddFields() {
        // retrieve the current values
        const eventModelManager = document.querySelector('#manageEventModels');
        let name = eventModelManager.querySelector('#addModelName').value;
        // let timeFrame = eventModelManager.querySelector('#addModelTimeFrame').value;
        // let area = eventModelManager.querySelector('#addModelArea').value;
        // let keyword = eventModelManager.querySelector('#addModelKeyword').value;

        if (this.validString(name) // && this.validString(timeFrame)
            // && this.validString(area) && this.validString(keyword)
            && this.state.addSelectedSevOption !== -1
            && this.state.addIconSelected !== -1) {
            if (!this.state.addingModel) {
                this.setState({"addingModel": true});
            }
        } else {
            if (this.state.addingModel) {
                this.setState({"addingModel": false});
            }
        }
    }

    updateEditFields() {
        // retrieve the current values
        const eventModelManager = document.querySelector('#manageEventModels');
        let name = eventModelManager.querySelector('#editModelName').value;
        // let timeFrame = eventModelManager.querySelector('#editModelTimeFrame').value;
        // let area = eventModelManager.querySelector('#editModelArea').value;
        // let keyword = eventModelManager.querySelector('#editModelKeyword').value;

        // retrieve the persisted values
        let targetModel = this.state.models.find(x => x.id === this.state.editModelSelected);

        if ((this.validString(name) && (name !== targetModel.name)) 
            // || (this.validString(timeFrame) && (parseInt(timeFrame, 10) !== targetModel.timeFrame))
            // || (this.validString(area) && (parseInt(area, 10) !== targetModel.area))
            // || (this.validString(keyword) && (keyword !== targetModel.keyword))
            || ((this.state.editSelectedSevOption !== -1) && (this.state.editSelectedSevOption !== targetModel.severity))
            || ((this.state.editIconSelected !== -1) && (this.state.editIconSelected !== targetModel.icon))) {
                if (!this.state.editingModel) {
                    this.setState({"editingModel": true});
                }
        } else {
            if (this.state.editingModel) {
                this.setState({"editingModel": false});
            }
        }   
    }

    updateFileList(event) {
        let targetFileInput = event.target.id.substring(0,3);

        if (targetFileInput === 'add') {
            this.setState({
                'addModelFileList': event.target.files,
            });
        } else if (targetFileInput === 'edi') {
            this.setState({
                'editModelFileList': event.target.files,
                'editingModel': true,
            });
        }
    }

    updateModel() {
        this.setState({
            editTrainModel: !this.state.editTrainModel,
        });
    }

    updateModels = function(newModels, onUpdateState) {
        let temp = newModels;
        temp.sort(this.modelCompare);
        this.setState({
            models: temp,
        }, onUpdateState);
    }

    updateIcons = function(newIcons) {
        this.setState({
            icons: newIcons,
        });
    }

    updateModelsList() {
        this.getModels()
            .then(res => {
                this.updateModels(res.result);
            })
            .catch(err => console.log(err));
    }

    updateIconsList() {
        getIcons()
            .then(res => {
                this.updateIcons(res.result);
            })
            .catch(err => console.log(err));
    }

    uploadData = async(formData) => {
        if (formData !== undefined) {
            let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/data', {
                method: 'PUT',
                headers: {
                    'enctype': 'multipart/form-data',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            let body = await response.json();

            if (response.status !== 200) throw Error(body.message);

            return body;
        } else {
            return { result: 'Success'};
        }    
    }

    validString(aString) {
        return aString && aString !== '';
    }

    render() {
        return (
            <div id="manageEventModels" className={this.props.displayClass}>
                <div className="card asgard-card">
                    <DialogHeader title="Manage Event Models" callback={this.close.bind(this)}/>
                    <div className="card-body asgard-body">
                        <ul className="nav nav-tabs">
                            <li className="asgard-tab active">
                                <a data-toggle="tab" href="#create" onClick={this.selectTab.bind(this)}>Create an Event Model</a>
                            </li>
                            <li className="asgard-tab">
                                <a data-toggle="tab" href="#edit" onClick={this.selectTab.bind(this)}>Edit &amp; Delete Event Models</a>
                            </li>
                        </ul>
                        <div className="tab-content pt-1">
                            <div id="create" className="tab-pane active">
                                <div className="asgard-body-section-header">Add a new Event Model</div>
                                <div>
                                    <div className="asgard-multi-column-section w-75">
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addModelName">Name&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addModelTrainingData">Training Data&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addTheSeverityDropdown">Severity&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="addModelIcon">Icon&nbsp;</label>
                                                </div>
                                            </div>  
                                        </div>
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <input id="addModelName" className="input-sm" onChange={this.updateAddFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="A user-defined, unique name for the Event that this Model will be used to detect e.g. Fire, Protest">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <input id="addModelTrainingData" className="input-sm" type="file" onChange={this.updateFileList.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Upload the dataset that will be used to train the Event Model to detect an occurance of that event">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label d-flex">
                                                    <TextDropdown id="addTheSeverityDropdown"
                                                                label="Severity Level"
                                                                options={this.state.sevOptions} 
                                                                selectedOption={this.state.addSelectedSevOption}
                                                                callback={this.sevSelectionCallback.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Specify a Severity Level indicative of the nature of the event">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label d-flex">
                                                    <IconPicker id="createModelIconPicker" 
                                                                selectedIcon={this.state.addIconSelected}
                                                                selectionCallback={this.createIconPickerSelectionCallback.bind(this)}
                                                                iconsCallback={this.iconPickerIconsCallback.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Select an Icon that will be used to represent an occurance of this event on the map">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="asgard-multi-column-section align-bottom w-25">
                                        <div className="h-100 ml-auto my-auto pr-4">
                                            { this.state.addingModel ? (
                                                <Checkbox id="addTrainModel"
                                                        checked={this.state.addTrainModel} 
                                                        label="Train Model"
                                                        callback={this.trainModel.bind(this)}/>
                                            ) : (
                                                <Checkbox id="addTrainModel"
                                                        checked={this.state.addTrainModel} 
                                                        label="Train Model"
                                                        callback={this.trainModel.bind(this)}
                                                        disabled/>
                                            )}
                                        </div>
                                        <div className="h-100 mt-auto align-bottom">
                                            { this.state.addingModel ? (
                                                <button className={this.state.addModelButtonClass} title="Add Event Model" onClick={this.add.bind(this)}>
                                                    <i className={this.state.addModelIconClass}></i>
                                                </button>
                                            ) : (
                                                <button className="btn btn-dark asgard-button disabled" title="Add Event Model">
                                                    <i className="fas fa-save"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="edit" className="tab-pane">
                                <div className="mb-auto asgard-multi-column-section w-30 align-top">
                                    <div className="col-12 scrollable-block asgard-multi-select-large list-group list-group-flush">
                                        {this.state.models.map((model, selectedID = this.state.editModelSelected) => (
                                            <a
                                                key={model.name}
                                                id={"editItem_" + model.id}
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
                                                    <i className={this.state.icons.find(icon => icon.id === model.icon).location} id={"iditItem_" + model.id}></i>
                                                    :
                                                    <img src={'/' + this.state.icons.find(icon => icon.id === model.icon).location} 
                                                        alt="User defined icon"
                                                        className="asgard-map-icon"/>
                                                    ) : (null)
                                                }
                                                <i className={this.state.modelStatuses.find(status => status.status === model.status).icon + 
                                                                ' asgard-model-status-icon my-auto'} 
                                                    title={this.state.modelStatuses.find(status => status.status === model.status).description}
                                                    id={`idStatus_${model.id}`}>
                                                </i>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div className="asgard-multi-column-section w-70 asgard-multi-select-partner">
                                    <div className={this.state.editModelClass}>
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="editModelName">Name&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="editModelTrainingData">Training Data&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="editTheSeverityDropdown">Severity&nbsp;</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <label htmlFor="editModelIcon">Icon&nbsp;</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <input id="editModelName" className="input-sm" onChange={this.updateEditFields.bind(this)} type="text"/>
                                                    &nbsp;
                                                    <a title="A user-defined, unique name for the Event that this Model will be used to detect e.g. Fire, Protest">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label">
                                                    <input id="editModelTrainingData" className="input-sm" type="file" onChange={this.updateFileList.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Upload the dataset that will be used to train the Event Model to detect an occurance of that event">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label d-flex">
                                                    <TextDropdown id="editTheSeverityDropdown"
                                                                label="Severity Level"
                                                                options={this.state.sevOptions} 
                                                                selectedOption={this.state.editSelectedSevOption}
                                                                callback={this.sevSelectionCallback.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Specify a Severity Level indicative of the nature of the event">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="asgard-field-label d-flex">
                                                    <IconPicker id="editModelIconPicker" 
                                                                selectedIcon={this.state.editIconSelected} 
                                                                selectionCallback={this.editIconPickerSelectionCallback.bind(this)}
                                                                iconsCallback={this.iconPickerIconsCallback.bind(this)}/>
                                                    &nbsp;
                                                    <a title="Select an Icon that will be used to represent an occurance of this event on the map">
                                                        <i className="fas fa-question-circle asgard-help"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column h-100 align-bottom mt-auto ml-auto">
                                        <div className="ml-auto">
                                            { this.state.editModelSelected !== -1 ? (
                                                <button className={this.state.removeModelButtonClass} title="Delete Event Model" onClick={this.remove.bind(this)}>
                                                    <i className={this.state.removeModelIconClass}></i>
                                                </button> 
                                            ) : (
                                                <button className="btn btn-dark asgard-button disabled" title="Delete Event Model">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                        </div>
                                        { this.state.editModelSelected !== -1 &&
                                            this.state.models.find(model => model.id === this.state.editModelSelected).status === "Training"
                                            ? (
                                                <div className="ml-auto pt-2">
                                                    <button className={this.state.cancelModelTrainingButtonClass} title="Cancel Model Training" onClick={this.cancelModelTraining.bind(this)}>
                                                        <i className={this.state.cancelModelTrainingIconClass}></i>
                                                    </button>    
                                                </div>
                                            ) : (
                                                null
                                            )
                                        }
                                        <div className="d-inline-flex ml-auto my-auto pt-4">
                                            <div className="my-auto pr-4">
                                                { (this.state.editingModel && this.state.editModelFileList.length) 
                                                    || (this.state.editModelSelected !== -1 && 
                                                        this.state.models.find(model => model.id === this.state.editModelSelected).status === "Created")
                                                    ? (
                                                    <Checkbox id="editTrainModel"
                                                            checked={this.state.editTrainModel} 
                                                            label="Train"
                                                            callback={this.updateModel.bind(this)}/>
                                                ) : (
                                                    <Checkbox id="editTrainModel"
                                                            checked={this.state.editTrainModel} 
                                                            label="Train"
                                                            callback={this.updateModel.bind(this)}
                                                            disabled/>
                                                )}
                                            </div>
                                            <div className="my-auto">
                                                { this.state.editingModel ||
                                                    (this.state.editModelSelected !== -1
                                                        && this.state.models.find(model => model.id === this.state.editModelSelected).status === "Created" 
                                                        && this.state.editTrainModel) ? (
                                                    <button className={this.state.editModelButtonClass} title="Save Update" onClick={this.save.bind(this)}>
                                                        <i className={this.state.editModelIconClass}></i>
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-dark asgard-button disabled" title="Save Update">
                                                        <i className="fas fa-save"></i>
                                                    </button>
                                                )}
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
}

export default EventModels;