/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

export default class EventsView extends Component {
  state = {
    events: [
      {
        id: '54312',
        event: 'Crash',
        catalog: 'TBA',
        location: 'Dublin',
        severity: 1,
      },
      {
        id: '33562',
        event: 'Crash',
        catalog: 'TBA',
        location: 'Spain',
        severity: 2,
      },
      {
        id: '35689',
        event: 'Crash',
        catalog: 'TBA',
        location: 'France',
        severity: 5,
      },
      {
        id: '23467',
        event: 'Crash',
        catalog: 'TBA',
        location: 'England',
        severity: 3,
      },
      {
        id: '76543',
        event: 'Crash',
        catalog: 'TBA',
        location: 'Dublin',
        severity: 1,
      },
    ],
  };

  componentDidMount() {
    this.getEvents();
  }

  getEvents = () => {
    //   fetch request to get the events here
  };

  render() {
    return (
      <div className="mt-4 ml-4">
        <h5>Last 20 Events - {this.props.context.selectedCity.city}</h5>
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Event</th>
              <th scope="col">Catalog</th>
              <th scope="col">Location</th>
              <th scope="col">Severity</th>
            </tr>
          </thead>
          <tbody>
            {this.state.events.map(event => (
              <tr key={event.id}>
                <th scope="row">{event.id}</th>
                <td>{event.event}</td>
                <td>{event.catalog}</td>
                <td>{event.location}</td>
                <td>{event.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
