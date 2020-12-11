/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

export default class CatalogPanel extends Component {
  state = {
    layers: [
      {
        name: 'sports',
        isVisible: true,
      },
      {
        name: 'Accidents',
        isVisible: true,
      },
      {
        name: 'Reports',
        isVisible: true,
      },
    ],
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

  render() {
    var catalogPanelStyle = {
        top: "3rem",
        right: "1rem",
        position: "absolute"
    };

    return (
        <div className="control-panel" style={catalogPanelStyle}>
            <div className="card">
                <div className="card-header p-2 text-center">Catalog</div>
                <div className="card-body">
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
}
