/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import '../css/SidebarMenu.css';

class SidebarMenu extends Component {

    openLocations() {
        this.props.callbackFromApp('Locations');
    }

    openEventModels() {
        this.props.callbackFromApp('EventModels');
    }

    openEvents() {
        this.props.callbackFromApp('Events');
    }

    openEventReplayer() {
        this.props.callbackFromApp('EventReplayer');
    }

    openDatasources() {
        this.props.callbackFromApp('Datasources');
    }

    openReports() {
        this.props.callbackFromApp('Reports');
    }

    openAlerts() {
        this.props.callbackFromApp('Alerts');
    }

    openSettings() {
        this.props.callbackFromApp('Settings');
    }

    render() {
        return(
            <div id="sidebarMenu" className={this.props.className}>
                <div className="asgard-menu-label">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>G.E.O.</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
                <div className="asgard-menu-item" onClick={this.openLocations.bind(this)}>Locations</div>
                <div className="asgard-menu-item" onClick={this.openEventModels.bind(this)}>Event Models</div>
                <div className="asgard-menu-item" onClick={this.openEvents.bind(this)}>Events</div>
                <div className="asgard-menu-item" onClick={this.openEventReplayer.bind(this)}>Event Replayer</div>
                <div className="asgard-menu-item" onClick={this.openDatasources.bind(this)}>Datasources</div>
                <div className="asgard-menu-item" onClick={this.openReports.bind(this)}>Reports</div>
                <div className="asgard-menu-item" onClick={this.openAlerts.bind(this)}>Alerts</div>
                <div className="asgard-menu-item last" onClick={this.openSettings.bind(this)}><i className="fas fa-cog fa-lg"></i></div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('SidebarMenu.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default SidebarMenu;
