/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class TextDropdown extends Component {
    constructor(props) {
        super(props);

        let temp = [];
        this.props.options.forEach(function(option, i){
            temp.push({
                'id': i,
                'text': option
            });
        });
        
        let initialSelected = -1;
        if (this.props.selectedOption && this.props.selectedOption !== -1) {
            initialSelected = this.props.selectedOption;
        }

        let initialDisabled = false;
        if (this.props.disabled !== null && this.props.disabled) {
            initialDisabled = true;
        }

        this.state = {
            options: temp,
            selectedOption: initialSelected,
            disabled: initialDisabled,
        };

        this.optionSelect = this.optionSelect.bind(this);
        this.updateSelectedOption = this.updateSelectedOption.bind(this);
    }
    
    

    componentDidMount() {
        
    }

    componentDidUpdate(previousProps) {
        if (previousProps.selectedOption !== this.props.selectedOption && this.props.selectedOption !== this.state.selectedOption) {
            this.updateSelectedOption(this.props.selectedOption);
            // callback again to force a recheck of the fields
            const prefix = this.props.id.substring(0, this.props.id.indexOf('T'));
            this.props.callback(prefix + 'FieldCheck', -1);
        }
    }

    optionSelect(event) {
        let elementId = (event.target.id).toString();
        let optionId = parseInt(elementId.substring(5), 10);
        if (this.state.optionSelected !== optionId) {
            // clear any previously selected
            let thisTextDropdown = document.getElementById(this.props.id);
            let selectedElements = thisTextDropdown.getElementsByClassName('asgard-list-group-item-selected');
            [].forEach.call(selectedElements, function(selectedElement) {
                if (selectedElement.parentElement.className === 'asgard-context') {
                    selectedElement.className = selectedElement.className.replace(/\b asgard-list-group-item-selected\b/g, "");
                }
            });

            // retrieve the icon object
            let targetOption = this.state.options.find(x => x.id === optionId);

            event.target.className = event.target.className + " asgard-list-group-item-selected";

            // finally callback if available
            if (this.props.callback) {
                this.props.callback(this.props.id.substring(0, this.props.id.indexOf('T')), targetOption.id);
            }
        }
    }

    updateSelectedOption(id) {
        this.setState({
            'selectedOption': id,
        });
    }

    render() {
        return (
            <div id={this.props.id}>
                {this.state.disabled ?
                    <div className="dropdown-toggle" id="dropdownMenuButton"
                        aria-haspopup="true" aria-expanded="false">
                        {(this.state.selectedOption === -1) ? 
                            ('Select a ' + this.props.label + '...')
                        : 
                            (this.state.options.find(option => option.id === this.state.selectedOption).text)
                        }
                    </div> 
                :
                    <div className="dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        {(this.state.selectedOption === -1) ? 
                            ('Select a ' + this.props.label + '...')
                            : 
                            (this.state.options.find(option => option.id === this.state.selectedOption).text)
                        }
                    </div>
                }
                {this.state.disabled ? 
                    <div></div>
                :
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <div className="asgard-context">
                            {this.state.options.map((option, i) => (
                                <a
                                    key={option.id}
                                    id={"opti_" + option.id}
                                    className={this.state.selectedOption === option.id ?
                                        "dropdown-item asgard-list-group-item-selected"
                                        :
                                        "dropdown-item asgard-list-group-item"
                                    }
                                    href="#"
                                    onClick={this.optionSelect.bind(this)}
                                >
                                    {option.text}
                                </a>
                            ))}
                        </div>
                    </div>
                }
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('TextDropdown.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default TextDropdown;