/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React from 'react';
import { Switch } from 'react-router-dom';
import MapContainer from '../screens/Map/MapContainer';
import EventsView from '../screens/Events/EventsView';
import GlobalView from '../screens/Global/GlobalView';
import AlertMangerView from '../screens/Alerts/AlertMangerView';
import RouteWithContext from '../router/RouteWithContext';

export default () => (
  <main>
    <Switch>
      <RouteWithContext exact path="/" component={MapContainer} />
      <RouteWithContext exact path="/map-ui/" component={MapContainer} />
      <RouteWithContext exact path="/map-ui/index.html" component={MapContainer} />
      <RouteWithContext exact path="/details" component={EventsView} />
      <RouteWithContext exact path="/globalview" component={GlobalView} />
      <RouteWithContext exact path="/alerts" component={AlertMangerView} />
    </Switch>
  </main>
);
