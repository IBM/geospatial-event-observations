/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React from 'react';
import { Route } from 'react-router-dom';
import { CityContext } from '../providers/CityProvider';

const RouteWithContext = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => <CityContext.Consumer>{val => <Component {...props} context={val} />}</CityContext.Consumer>}
  />
);

export default RouteWithContext;
