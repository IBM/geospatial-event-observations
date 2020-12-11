/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

export default class GlobalView extends Component {
  state = {
    eventID: '',
    backgroundInfo: '',
    placeholder1: '',
    contentTypes: [
      {
        name: 'Images',
        isChecked: true,
      },
      {
        name: 'Text',
        isChecked: false,
      },
      {
        name: 'Video',
        isChecked: false,
      },
    ],
  };
  handleInputChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { eventID, backgroundInfo, placeholder1, contentTypes } = this.state;
    const selectedContentTypes = contentTypes.filter(type => type.isChecked === true).map(type => type.name);
    console.log({
      eventID,
      backgroundInfo,
      placeholder1,
      selectedContentTypes,
    });
  };

  onVisibilityChange = name => {
    const existingContentTypes = this.state.contentTypes;
    const layerToChangeIndex = existingContentTypes.findIndex(type => type.name === name);
    existingContentTypes[layerToChangeIndex].isChecked = !existingContentTypes[layerToChangeIndex].isChecked;

    this.setState({
      contentTypes: existingContentTypes,
    });

    // todo: Update map to make that layer disappear
  };

  render() {
    return (
      <form className="mt-4 ml-4" onSubmit={this.handleSubmit}>
        <h3 className="text-center mb-4">Generate a Report</h3>
        <div className="form-group row">
          <label htmlFor="eventID" className="col-sm-2 col-form-label">
            Event ID:
          </label>
          <div className="col-sm-8">
            <input
              type="text"
              className="form-control"
              id="eventID"
              placeholder="Enter Event ID"
              value={this.state.eventID}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="backgroundInfo" className="col-sm-2 col-form-label">
            Background Information (%):
          </label>
          <div className="col-sm-8">
            <input
              type="number"
              className="form-control"
              id="backgroundInfo"
              placeholder="Enter %"
              min="1"
              max="100"
              value={this.state.backgroundInfo}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="placeholder1" className="col-sm-2 col-form-label">
            [Place holder]:
          </label>
          <div className="col-sm-8">
            <input
              type="text"
              className="form-control"
              id="placeholder1"
              placeholder="Placeholder"
              value={this.state.placeholder1}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="contentType" className="col-sm-2 col-form-label">
            Content Type:
          </label>
          <div className="col-sm-8">
            {this.state.contentTypes.map(({ name, isChecked }) => (
              <div key={name} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inlineCheckbox1"
                  checked={isChecked}
                  onChange={() => this.onVisibilityChange(name)}
                />
                <label className="form-check-label" htmlFor="inlineCheckbox1">
                  {name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Generate Report
        </button>
      </form>
    );
  }
}
