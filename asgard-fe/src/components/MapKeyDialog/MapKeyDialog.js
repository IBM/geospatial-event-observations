/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class MapKeyDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editInProgress: false,
            key: props.mapboxKey,
            saveKeyButtonClass: 'btn btn-dark asgard-button',
            saveKeyIconClass: 'fas fa-save',
            savingKey: false,
        };

        this.get = this.get.bind(this);
        this.onChange = this.onChange.bind(this);
        this.save = this.save.bind(this);
        this.saveKey = this.saveKey.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mapboxKey !== this.props.mapboxKey) {
            this.setState({
                key: this.props.mapboxKey,
            });
        }
    }

    get(id) {
        return document.querySelector(`#${id}`).value;
    }

    onChange() {
        const keyValue = this.get('keyField');
        this.setState({
            key: keyValue,
            editInProgress: this.props.mapboxKey !== keyValue
        });
    }

    render() {
        return (
            <div>
                <div className="asgard-multi-column-section form-check w-80">
                    <div className="d-inline-flex w-100">
                        <div className="d-flex flex-column">
                            <div className="asgard-field-label">
                                <label htmlFor="keyField">Key&nbsp;</label>
                            </div>
                        </div>
                        <div className="d-flex flex-column w-80">
                            <div className="asgard-field-label">
                                <input id="keyField" className="w-100" type="password" value={this.state.key}
                                        onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="asgard-multi-column-section align-bottom w-20">
                    <div className="ml-auto mt-auto">
                        { this.state.editInProgress ? (
                            <button className={this.state.saveKeyButtonClass} title="Save Key" onClick={this.save.bind(this)}>
                                <i className={this.state.saveKeyIconClass}></i>
                            </button>
                        ) : (
                            <button className={`${this.state.saveKeyButtonClass} disabled`} title="Save Key">
                                <i className={this.state.saveKeyIconClass}></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    save() {
        if (!this.state.savingKey) {
            this.setState({
                editInProgress: false,
                savingKey: true,
                saveKeyIconClass: 'fas fa-sync-alt fa-spin'
            });

            this.saveKey(this.get('keyField'))
                .then(res => {
                    this.setState({
                        editInProgress: false,
                        savingKey: false,
                        saveKeyIconClass: 'fas fa-save'
                    });

                    this.props.callback();
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        editInProgress: true,
                        savingKey: false,
                        saveKeyIconClass: 'fas fa-save'
                    });
                })
        }
    }

    saveKey = async(key) => {
        let response = await fetch(process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/mapkey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'key': key }),
        });

        let body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

    static getDerivedStateFromError(error) {
        console.log('KeyDialog.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default MapKeyDialog;