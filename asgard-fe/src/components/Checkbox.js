/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class Checkbox extends Component {

    constructor(props) {
        super(props);

        let initialChecked = false;
        if (props.checked !== null && props.checked) {
            initialChecked = true;
        }

        let initialLabel = '';
        if (props.label !== null) {
            initialLabel = props.label;
        }

        let initialActive = true;
        let disabledClass = '';
        if (props.disabled !== undefined) {
            initialActive = false;
            disabledClass = ' disabled';
        }

        this.state = {
            active: initialActive,
            checked: initialChecked,
            checkboxClass: (initialChecked ? `asgard-checkbox checked${disabledClass}` : `asgard-checkbox${disabledClass}`),
            label: initialLabel,
        };

        this.click = this.click.bind(this);
        this.validString = this.validString.bind(this);
    }

    click(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.active) {
            const checked = !this.state.checked;
            let checkboxClass = checked ? 'asgard-checkbox checked' : 'asgard-checkbox';

            this.setState({
                'checked': checked,
                'checkboxClass': checkboxClass,
            });

            // call callback
            this.props.callback(checked);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let updatedState = undefined;
        let updatedCheckboxClass = 'asgard-checkbox';
        if (this.props.checked !== prevProps.checked) {
            // init updatedState
            updatedState = {
                'checkboxClass': `${updatedCheckboxClass}${this.state.active ? '' : ' disabled'}`
            };
            if (this.props.checked !== undefined && this.props.checked) {
                updatedState.checked = true;
                updatedState.checkboxClass += ' checked';
            } else {
                updatedState.checked = false;
            }
        }

        if (this.props.disabled !== prevProps.disabled) {
            // init updatedState
            if (updatedState === undefined) {
                updatedState = {
                    'checkboxClass': `${updatedCheckboxClass}${this.state.checked ? ' checked' : ''}`
                };
            }

            if (this.props.disabled === undefined) {
                updatedState.active = true;
                // if disabled was added to the checkbox class - remove it
                if (updatedState.checkboxClass.indexOf('disabled') !== -1) {
                    updatedState.checkboxClass = updatedState.checkboxClass.replace(/\b disabled\b/g, "");
                }
            } else {
                updatedState.active = false;
                if (updatedState.checkboxClass.indexOf('disabled') === -1) {
                    updatedState.checkboxClass += ' disabled';
                }
            }
        }

        if (updatedState !== undefined) {
            this.setState(updatedState);
        }
    }

    render() {
        return (
            <div id={this.props.id} className="d-flex align-middle" onClick={this.click.bind(this)}>
                { this.state.active ? (
                    <div className={ this.validString(this.state.label) ? 'asgard-checkbox-label clickable pr-2' : ''}>
                        {this.state.label}
                    </div>
                ) : (
                    <div className={ this.validString(this.state.label) ? 'asgard-checkbox-label disabled pr-2' : ''}>
                        {this.state.label}
                    </div>
                )}
                <div className={this.state.checkboxClass}></div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('Checkbox.GetDerivedStateFromError:');
        console.log(error);
    }

    validString(aString) {
        return aString && aString !== '' && (/\S/g).test(aString);
    }
}

export default Checkbox;