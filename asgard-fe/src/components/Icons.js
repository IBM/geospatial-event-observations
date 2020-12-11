/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class Icons extends Component {
    state = {
        icons: [],
        selectedIcon: -1,
        selectedIconClass: '',
        addingIcon: false,
        addInProgress: false,
        addIconButtonClass: 'btn btn-dark asgard-button',
        addIconClass: 'fas fa-save',
        addIconFileList: [],
        removeIconButtonClass: 'btn btn-dark asgard-button',
        removeIconClass: 'fas fa-trash-alt',
        removeInProgress: false,
    };

    add() {
        if(!this.state.addInProgress) {
            // font awesome addition
            const iconsManager = document.querySelector('#iconsManager');
            let fontAwesomeRadioButtonChecked = iconsManager.querySelector('#asgardFARadio').className.indexOf('checked') !== -1 ? true : false;
            if (fontAwesomeRadioButtonChecked) {
                let iconClass = iconsManager.querySelector('#addIconField').value;
                let iconExamples = iconsManager.querySelector('#addIconExamples').value;
                
                if (this.validString(iconClass) && this.validString(iconExamples)) {
                    this.setState({
                        'addInProgress': true,
                        'addIconButtonClass': 'btn btn-dark asgard-button disabled',
                        'addIconClass': 'fas fa-sync-alt fa-spin',
                    });
                    
                    const newIcon = {
                        'type': 'font-awesome',
                        'examples': iconExamples,
                        'location': iconClass
                    };

                    this.addIcon(newIcon)
                        .then(res =>{
                            if (res.result === 'Success') {
                                // update the icons list
                                this.getIcons()
                                    .then(iconsRes => {
                                        this.updateIcons(iconsRes.result);
                                        
                                        // find the ID for the new icon
                                        const targetIcon = iconsRes.result.find(x => x.location === iconClass);
                                        // set the just added icon as the selected icon
                                        this.setState({
                                            'addingIcon': false,
                                            'addInProgress': false,
                                            'addIconButtonClass': 'btn btn-dark asgard-button',
                                            'addIconClass': 'fas fa-save',
                                            'selectedIcon': targetIcon.id,
                                            'selectedIconClass': iconClass,
                                        });

                                        // clear the add fields
                                        this.clearFields();
                                    })
                                    .catch(err => console.log(err));
                            } else {
                                console.log('There was a problem adding the specified icon:' + res.error_message);
                                this.setState({
                                    'addInProgress': false,
                                    'addIconButtonClass': 'btn btn-dark asgard-button',
                                    'addIconClass': 'fas fa-save',
                                });
                            }
                        })
                        .catch(err => console.log(err));
                }
            } else { // file upload
                const iconExamples = iconsManager.querySelector('#addIconExamples').value;
                
                if (this.validString(iconExamples) && this.state.addIconFileList.length) {
                    const iconFileName = this.state.addIconFileList[0].name;
                    this.setState({
                        'addInProgress': true,
                        'addIconButtonClass': 'btn btn-dark asgard-button disabled',
                        'addIconClass': 'fas fa-sync-alt fa-spin',
                    });

                    //create a new FormData object to send the file
                    let formData = new FormData();
                    formData.append('id', -1);
                    formData.append('location', '');
                    formData.append('type', 'file');
                    formData.append('examples', iconExamples);
                    formData.append('file', this.state.addIconFileList[0], iconFileName);

                    this.addIconFile(formData)
                        .then(res => {
                            if (res.result === 'Success') {
                                // update the icons list
                                this.getIcons()
                                    .then(iconsRes => {
                                        this.updateIcons(iconsRes.result);
                                        
                                        // find the ID for the new icon
                                        const targetIcon = iconsRes.result.find(x => x.location === res.icon);
                                        // set the just added icon as the selected icon
                                        this.setState({
                                            'addingIcon': false,
                                            'addInProgress': false,
                                            'addIconButtonClass': 'btn btn-dark asgard-button',
                                            'addIconClass': 'fas fa-save',
                                            'selectedIcon': targetIcon.id,
                                            'selectedIconClass': '/' + targetIcon.location,
                                        });

                                        // clear the add fields
                                        this.clearFields();

                                        // callback if available
                                        if (this.props.callback) {
                                            this.props.callback(targetIcon);
                                        }
                                    })
                                    .catch(err => console.log(err));
                            } else {
                                console.log('There was a problem adding the specified icon file:' + res.error_message);
                                this.setState({
                                    'addInProgress': false,
                                    'addIconButtonClass': 'btn btn-dark asgard-button',
                                    'addIconClass': 'fas fa-save',
                                });
                            }
                        })
                        .catch(err => console.log(err))
                }
            }
        } else {
            console.log('A new icon is currently being added. Please try again later!');
        }
    }

    addIcon = async(anIcon) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/icons', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(anIcon),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;    
    }

    addIconFile = async(formData) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/icons', {
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
    }

    clearFields() {
        this.selectFontAwesome();
        const iconsManager = document.querySelector('#iconsManager');
        iconsManager.querySelector('#addIconField').value = '';
        iconsManager.querySelector('#addIconFile').value = '';
        iconsManager.querySelector('#addIconExamples').value = '';
    }

    componentDidMount() {
        this.updateIconsList();
    }

    getIcons = async() => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/icons');
        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    iconCompare(a,b) {
        let iconA = a.examples.toUpperCase();
        let iconB = b.examples.toUpperCase();
        if (iconA > iconB) {
            return 1;
        }
        if (iconA < iconB) {
            return -1;
        }
        return 0;    
    }

    iconSelect(event) {
        let elementId = event.target.id;
        let iconId = parseInt(elementId.substring(5), 10);
        if (this.state.selectedIcon !== iconId) {
            // clear any previously selected
            const iconsManager = document.getElementById('iconsManager');
            let selectedElements = iconsManager.getElementsByClassName('asgard-list-group-item-selected');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\b asgard-list-group-item-selected\b/g, "");
            });

            //set the item as selected
            this.setState({
                'selectedIcon': iconId,
            });

            if (elementId.substring(0,1) === 'a') {
                event.target.className = event.target.className + " asgard-list-group-item-selected";
            } else if (elementId.substring(0,1) === 'i') {
                event.target.parentElement.className = event.target.parentElement.className + " asgard-list-group-item-selected";
            }
        }
    }

    selectFontAwesomeCustom(event) {
        this.selectFontAwesome();
    }

    selectFontAwesome() {
        const iconsManager = document.querySelector('#iconsManager');
        const faChecked = iconsManager.querySelector('#asgardFARadio').className.indexOf('checked') !== -1 ? true : false; 
        if (!faChecked) {
            let asgardFileRadio = iconsManager.querySelector('#asgardFileRadio');
            asgardFileRadio.className = asgardFileRadio.className.replace(/\b checked\b/g, "");

            let asgardFARadio = iconsManager.querySelector('#asgardFARadio');
            asgardFARadio.className = asgardFARadio.className + ' checked';

            // hide File field
            let hideLabel = iconsManager.querySelector('#iconFileLabelDiv');
            hideLabel.className = hideLabel.className + ' disposed';
            let hideInput = iconsManager.querySelector('#iconFileDiv'); 
            hideInput.className = hideInput.className + ' disposed';

            // show font awesome
            let showLabel = iconsManager.querySelector('#iconFieldLabelDiv');
            showLabel.className = showLabel.className.replace(/\b disposed\b/g, "");
            let showInput = iconsManager.querySelector('#iconFieldDiv');
            showInput.className = showInput.className.replace(/\b disposed\b/g, "");
        }
    }

    selectFileCustom(event) {
        const iconsManager = document.querySelector('#iconsManager');
        const fileChecked = iconsManager.querySelector('#asgardFileRadio').className.indexOf('checked') !== -1 ? true : false; 
        if (!fileChecked) {
            let asgardFileRadio = iconsManager.querySelector('#asgardFARadio');
            asgardFileRadio.className = asgardFileRadio.className.replace(/\b checked\b/g, "");

            let asgardFARadio = iconsManager.querySelector('#asgardFileRadio');
            asgardFARadio.className = asgardFARadio.className + ' checked';

            // hide FA class field
            let hideLabel = iconsManager.querySelector('#iconFieldLabelDiv');
            hideLabel.className = hideLabel.className + ' disposed';
            let hideInput = iconsManager.querySelector('#iconFieldDiv'); 
            hideInput.className = hideInput.className + ' disposed';

            // show file upload
            let showLabel = iconsManager.querySelector('#iconFileLabelDiv');
            showLabel.className = showLabel.className.replace(/\b disposed\b/g, "");
            let showInput = iconsManager.querySelector('#iconFileDiv'); 
            showInput.className = showInput.className.replace(/\b disposed\b/g, "");
        }
    }

    updateAddFields() {
        // if the add fields are changed enable the ability to add the icon
        const iconsManager = document.querySelector('#iconsManager');
        const fileChecked = iconsManager.querySelector('#asgardFileRadio').className.indexOf('checked') !== -1 ? true : false;
        // retrieve the current values
        let addClass = '';
        if (fileChecked && this.state.addIconFileList.length ) {
            addClass = this.state.addIconFileList[0].name;
        } else {
            addClass = iconsManager.querySelector('#addIconField').value;
        }
        let addExamples = iconsManager.querySelector('#addIconExamples').value;

        if (this.validString(addClass) && this.validString(addExamples)) {
            if (!this.state.addingIcon) {
                this.setState({"addingIcon": true});
            }
        } else {
            if (this.state.addingIcon) {
                this.setState({"addingIcon": false});
            }
        }    
    }

    updateFileList(event) {
        this.setState({
            'addIconFileList': event.target.files,
        });
    }

    updateIcons = function(newIcons, onUpdateState) {
        let temp = newIcons;
        temp.sort(this.iconCompare);
        this.setState({
            icons: temp,
        }, onUpdateState);

        // send icons back if callback is present
        if (this.props.iconsCallback) {
            this.props.iconsCallback(temp);
        } 
    }

    updateIconsList() {
        this.getIcons()
            .then(res => {
                this.updateIcons(res.result);
            })
            .catch(err => console.log(err));
    }

    updateSelectedIcon(id) {
        if (id !== -1) {
            const targetIcon = this.state.icons.find(icon => icon.id === id);
            this.setState({
                'selectedIcon': targetIcon.id,
                'selectedIconClass': targetIcon.location,
            });
        } else {
            this.setState({
                'selectedIcon': -1,
                'selectedIconClass': '',
            });
        }
    }

    validString(aString) {
        return aString && aString !== '' && (/\S/g).test(aString);
    }

    remove() {
        if (!this.state.removeInProgress) {
            if (this.state.selectedIcon !== -1) {
                // update the remove button to indicate progress
                this.setState({
                    'removeInProgress': true,
                    'removeIconButtonClass': 'btn btn-dark asgard-button disabled',
                    'removeIconClass': 'fas fa-sync-alt fa-spin',
                });

                let target = this.state.icons.find(x => x.id === this.state.selectedIcon);
                this.removeIcon(target)
                    .then( res => {
                        // check for success
                        if (res.result === 'Success') {
                            // refresh the icons list
                            this.updateIconsList();

                            this.setState({
                                'selectedIcon': -1,
                                'selectedIconClass': '',
                            });
                        } else {
                            console.log('There was a problem deleting the selected icon: ' + res.error_message);
                        }
                        this.setState({
                            'removeInProgress': false,
                            'removeIconButtonClass': 'btn btn-dark asgard-button',
                            'removeIconClass': 'fas fa-trash-alt',
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        this.setState({
                            'removeInProgress': false,
                            'removeIconButtonClass': 'btn btn-dark asgard-button',
                            'removeIconClass': 'fas fa-trash-alt',
                        });
                    });
            }
        } else {
            console.log('An icon is currently being deleted. Please try again later!');
        }
    }

    removeIcon = async(anIcon) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/icons', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(anIcon),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    render() {
        return (
            <div id="iconsManager">
                <div>
                    <div className="d-flex pl-2 pt-1">
                        <div className="asgard-radio-group-member d-inline-flex" onClick={this.selectFontAwesomeCustom.bind(this)}>
                            <div id="asgardFARadio" className="asgard-radio-button checked"></div>
                            <div>&nbsp;Font Awesome</div>
                        </div>
                        <div className="asgard-radio-group-member d-inline-flex pl-2" onClick={this.selectFileCustom.bind(this)}>
                            <div id="asgardFileRadio" className="asgard-radio-button"></div>
                            <div>&nbsp;File</div>
                        </div>
                    </div>
                </div>
                <div className="asgard-multi-column-section">
                    <div>
                        <div id="iconFieldLabelDiv" className="d-flex flex-column">
                            <div className="asgard-field-label">
                                <label htmlFor="addIconField">Class&nbsp;</label>
                            </div>
                        </div>
                        <div id="iconFileLabelDiv" className="d-flex flex-column disposed">
                            <div className="asgard-field-label">
                                <label htmlFor="addIconFile">Image&nbsp;</label>
                            </div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="asgard-field-label">
                                <label htmlFor="addIconExamples">e.g.&nbsp;</label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div id="iconFieldDiv" className="d-flex flex-column">
                            <div className="asgard-field-label">
                                <input id="addIconField" className="input-sm" type="text" onChange={this.updateAddFields.bind(this)}/>
                                &nbsp;
                                <a title="A font-awesome icon tag class value (e.g. fas fa-ambulance)">
                                    <i className="fas fa-question-circle asgard-help"></i>
                                </a>
                            </div>
                        </div>
                        <div id="iconFileDiv" className="d-flex flex-column disposed">
                            <div className="asgard-field-label">
                                <input id="addIconFile" className="input-sm" type="file" onChange={this.updateFileList.bind(this)}/>
                                &nbsp;
                                <a title="An image file (jpg, png, bmp, ico) that can be used as map marker (max size 64x64 pixels)">
                                    <i className="fas fa-question-circle asgard-help"></i>
                                </a>
                            </div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="asgard-field-label">
                                <input id="addIconExamples" className="input-sm" type="text" onChange={this.updateAddFields.bind(this)}/>
                                &nbsp;
                                <a title="Text examples of what the Icon could represent">
                                    <i className="fas fa-question-circle asgard-help"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="align-bottom asgard-multi-column-section">
                    { this.state.addingIcon ? (
                        <button className={this.state.addIconButtonClass} title="Add Icon" onClick={this.add.bind(this)}>
                            <i className={this.state.addIconClass}></i>
                        </button>
                    ) : (
                        <button className="btn btn-dark asgard-button disabled" title="Add Icon">
                            <i className="fas fa-save"></i>
                        </button>
                    )}
                </div>
                <hr/>
                <div className="d-flex">
                    <div className="asgard-multi-column-section">
                        <div className="col-12 scrollable-block asgard-multi-select list-group list-group-flush">
                            {this.state.icons.map(icon => (
                                <a
                                    key={icon.id}
                                    id={"acon_" + icon.id}
                                    className={this.state.selectedIcon === icon.id ?
                                        "list-group-item py-1 list-group-action asgard-list-group-item asgard-list-group-item-selected"
                                        :
                                        "list-group-item py-1 list-group-action asgard-list-group-item"
                                    }
                                    onClick={this.iconSelect.bind(this)}
                                >
                                    { icon.type === 'font-awesome' ?
                                        <i 
                                            id={"icon_" + icon.id} 
                                            className={icon.location}
                                            onClick={this.iconSelect.bind(this)}
                                        ></i>
                                        :
                                        <img src={"/" + icon.location} alt="User defined icon" className="asgard-map-icon"/>
                                    }
                                    &nbsp;e.g.&nbsp;{icon.examples}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="asgard-multi-column-section h-100 mt-auto">
                        <div className="pt-1 ml-auto">
                            { this.state.selectedIcon !== -1 ? (
                                <button className={this.state.removeIconButtonClass} title="Delete Icon" onClick={this.remove.bind(this)}>
                                    <i className={this.state.removeIconClass}></i>
                                </button> 
                            ) : (
                                <button className="btn btn-dark asgard-button disabled" title="Delete Icon">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            )}
                        </div>
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

export default Icons;