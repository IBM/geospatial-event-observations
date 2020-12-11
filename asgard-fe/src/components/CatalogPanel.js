/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import '../css/CatalogPanel.css';

export default class CatalogPanel extends Component {
    state = {
        layers: [
            {
                name: 'Crowd',
                isVisible: true,
            },
            {
                name: 'Traffic Incident',
                isVisible: false,
            },
            {
                name: 'Fire',
                isVisible: false,
            },
        ],
        dispose: "control-panel asgard-panel",
    };

    onVisibilityChange = name => {
        const existingLayers = this.state.layers;
        const layerToChangeIndex = this.state.layers.findIndex(layer => layer.name === name);
        existingLayers[layerToChangeIndex].isVisible = !existingLayers[layerToChangeIndex].isVisible;

        this.setState({
            layers: existingLayers,
        });

        // todo: Update map to make that layer disappear
    };

    dispose() {
        this.setState({"dispose":"control-panel asgard-panel disposed"});
    };

    render() {
        var catalogPanelStyle = {
            top: "3rem",
            right: "1rem",
            position: "absolute",
            zIndex: "5"
        };

        var cardStyle = {
            backgroundColour: "rgba(255,255,255,0) !important",
        };

        var cardHeaderStyle = {
            backgroundColor: "rgba(59,104,123,0.5) !important",
            padding: "0px 0.5rem !important",
        };

        var cardBodyStyle = {
            backgroundColor: "rgba(255,255,255,1) !important",
        };

        return (
            <div className={this.state.dispose}>
                <div className="card asgard-card">
                    <div className="card-header asgard-header">
                        <div className="asgard-card-header-item">Events</div>
                        <div className="ml-auto asgard-card-header-item">
                            <a onClick={() => this.dispose()}>
                                <i className="fas fa-times fa-xs asgard-control"></i>
                            </a>
                        </div>
                    </div>
                    <div className="card-body asgard-body">
                        <form className="form">
                            {this.state.layers.map(({ name, isVisible }) => (
                                <div key={name} className="form-group">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value=""
                                            checked={isVisible}
                                            id="defaultCheck1"
                                            onChange={() => this.onVisibilityChange(name)}
                                        />
                                        <label style={{ textTransform: 'uppercase' }} className="form-check-label" htmlFor="defaultCheck1">
                                            {name}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('CatalogPanel.GetDerivedStateFromError:');
        console.log(error);
    }
}
