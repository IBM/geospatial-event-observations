/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class IconPicker extends Component {
    state = {
        icons: [],
        selectedIcon: -1,
        selectedIconClass: '',
        addingIcon: false,
        addInProgress: false,
        addIconButtonClass: 'btn btn-dark asgard-button',
        addIconClass: 'fas fa-save',
        addIconFileList: [],
    };

    add() {
        if(!this.state.addInProgress) {
            // font awesome addition
            const thisIconPicker = document.querySelector('#' + this.props.id);
            let fontAwesomeRadioButtonChecked = thisIconPicker.querySelector('#asgardFARadio').className.indexOf('checked') !== -1 ? true : false;
            if (fontAwesomeRadioButtonChecked) {
                let iconClass = thisIconPicker.querySelector('#addIconField').value;
                let iconExamples = thisIconPicker.querySelector('#addIconExamples').value;
                
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
                const iconExamples = thisIconPicker.querySelector('#addIconExamples').value;
                
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
        const thisIconPicker = document.querySelector('#' + this.props.id);
        thisIconPicker.querySelector('#addIconField').value = '';
        thisIconPicker.querySelector('#addIconFile').value = '';
        thisIconPicker.querySelector('#addIconExamples').value = '';
    }

    clickIconPicker(event) {
        console.log('Document click handler...');
        console.log(event);
        const targetClassName = event.target.className;
        const parentClassName = event.target.parentElement.className;
        if (targetClassName.indexOf('no-close-on-click') !== -1 || parentClassName.indexOf('no-close-on-click') !== -1) {
            console.log('IconPicker Document Listener:');
            console.log(event);
            event.stopPropagation();
            event.preventDefault();
            // event.nativeEvent.stopImmediatePropagation();
        }
    }

    componentDidMount() {
        this.updateIconsList();
        if (this.props.selectedIcon && this.props.selectedIcon !== -1) {
            this.updateSelectedIcon(this.props.selectedIcon);
        }
        // document.addEventListener('click', this.clickIconPicker);
        document.addEventListener('hide', this.clickIconPicker);
    }

    componentDidUpdate(previousProps) {
        if (previousProps.selectedIcon !== this.props.selectedIcon && this.props.selectedIcon !== this.state.selectedIcon) {
            this.updateSelectedIcon(this.props.selectedIcon);
        }
    }

    contextPreventDefault(event) {
        event.preventDefault();
        event.nativeEvent.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        // console.log('Entering context prevent default...');
        console.log('Trying to prevent default for:');
        console.log(event);
        console.log(event.nativeEvent);
        // return false;
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
        let elementId = (event.target.id).toString();
        let iconId = parseInt(elementId.substring(5), 10);
        if (this.state.iconSelected !== iconId) {
            // clear any previously selected
            let thisIconPicker = document.getElementById(this.props.id);
            let selectedElements = thisIconPicker.getElementsByClassName('asgard-list-group-item-selected');
            [].forEach.call(selectedElements, function(selectedElement) {
                if (selectedElement.parentElement.className === 'asgard-context') {
                    selectedElement.className = selectedElement.className.replace(/\b asgard-list-group-item-selected\b/g, "");
                }
            });

            // retrieve the icon object
            let targetIcon = this.state.icons.find(x => x.id === iconId);

            //set the item as selected
            this.setState({
                'selectedIcon': iconId,
                'selectedIconClass': targetIcon.location,
            });

            if (elementId.substring(0,1) === 'a') {
                event.target.className = event.target.className + " asgard-list-group-item-selected";
            } else if (elementId.substring(0,1) === 'i') {
                event.target.parentElement.className = event.target.parentElement.className + " asgard-list-group-item-selected";
            }

            // finally callback if available
            if (this.props.selectionCallback) {
                this.props.selectionCallback(targetIcon);
            }
        }
    }

    openContext(event) {
        let thisIconPicker = document.getElementById('' + this.props.id);
        console.log(thisIconPicker);
        for (let i=0; i<thisIconPicker.childNodes.length; i++) {
            if (thisIconPicker.childNodes[i].className === 'dropdown-menu') {
                thisIconPicker.childNodes[i].className = thisIconPicker.childNodes[i].className + ' show';
            }
        }
    }

    selectFontAwesomeCustom(event) {
        event.preventDefault();
        event.stopPropagation();
        this.selectFontAwesome();
    }

    selectFontAwesome() {
        const thisIconPicker = document.querySelector('#' + this.props.id);
        const faChecked = thisIconPicker.querySelector('#asgardFARadio').className.indexOf('checked') !== -1 ? true : false; 
        if (!faChecked) {
            let asgardFileRadio = thisIconPicker.querySelector('#asgardFileRadio');
            asgardFileRadio.className = asgardFileRadio.className.replace(/\b checked\b/g, "");

            let asgardFARadio = thisIconPicker.querySelector('#asgardFARadio');
            asgardFARadio.className = asgardFARadio.className + ' checked';

            // hide File field
            let hideLabel = thisIconPicker.querySelector('#iconFileLabelDiv');
            hideLabel.className = hideLabel.className + ' disposed';
            let hideInput = thisIconPicker.querySelector('#iconFileDiv'); 
            hideInput.className = hideInput.className + ' disposed';

            // show font awesome
            let showLabel = thisIconPicker.querySelector('#iconFieldLabelDiv');
            showLabel.className = showLabel.className.replace(/\b disposed\b/g, "");
            let showInput = thisIconPicker.querySelector('#iconFieldDiv');
            showInput.className = showInput.className.replace(/\b disposed\b/g, "");
        }
    }

    selectFileCustom(event) {
        event.preventDefault();
        event.stopPropagation();
        const thisIconPicker = document.querySelector('#' + this.props.id);
        const fileChecked = thisIconPicker.querySelector('#asgardFileRadio').className.indexOf('checked') !== -1 ? true : false; 
        if (!fileChecked) {
            let asgardFileRadio = thisIconPicker.querySelector('#asgardFARadio');
            asgardFileRadio.className = asgardFileRadio.className.replace(/\b checked\b/g, "");

            let asgardFARadio = thisIconPicker.querySelector('#asgardFileRadio');
            asgardFARadio.className = asgardFARadio.className + ' checked';

            // hide FA class field
            let hideLabel = thisIconPicker.querySelector('#iconFieldLabelDiv');
            hideLabel.className = hideLabel.className + ' disposed';
            let hideInput = thisIconPicker.querySelector('#iconFieldDiv'); 
            hideInput.className = hideInput.className + ' disposed';

            // show file upload
            let showLabel = thisIconPicker.querySelector('#iconFileLabelDiv');
            showLabel.className = showLabel.className.replace(/\b disposed\b/g, "");
            let showInput = thisIconPicker.querySelector('#iconFileDiv'); 
            showInput.className = showInput.className.replace(/\b disposed\b/g, "");
        }
    }

    updateAddFields() {
        // if the add fields are changed enable the ability to add the icon
        const thisIconPicker = document.querySelector('#' + this.props.id);
        const fileChecked = thisIconPicker.querySelector('#asgardFileRadio').className.indexOf('checked') !== -1 ? true : false;
        // retrieve the current values
        let addClass = '';
        if (fileChecked && this.state.addIconFileList.length ) {
            addClass = this.state.addIconFileList[0].name;
        } else {
            addClass = thisIconPicker.querySelector('#addIconField').value;
        }
        let addExamples = thisIconPicker.querySelector('#addIconExamples').value;

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

    render() {
        return (
            <div id={this.props.id}>
                <div className="dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false">
                    {(this.state.selectedIcon === -1) ? 
                        'Select an Icon...' 
                        : 
                        (this.state.icons.find(icon => icon.id === this.state.selectedIcon).type === 'font-awesome') ?
                            <i className={this.state.selectedIconClass}></i>
                            :
                            <img src={"/" + this.state.selectedIconClass} alt="User defined icon" className="asgard-map-icon"/>
                    }
                </div>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <div className="asgard-context">
                        {this.state.icons.map((icon, i) => (
                            <a
                                key={icon.id}
                                id={"acon_" + icon.id}
                                className={this.state.selectedIcon === icon.id ?
                                    "dropdown-item asgard-list-group-item-selected"
                                    :
                                    "dropdown-item asgard-list-group-item"
                                }
                                href="#"
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
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('IconPicker.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default IconPicker;