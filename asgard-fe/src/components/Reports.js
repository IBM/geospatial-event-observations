/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';

class Reports extends Component {
    close() {
        console.log('Calling callback function');
        this.props.callbackFromApp();
    }

    render() {
        return (
            <div id="manageReports" className={this.props.displayClass}>
                <div className="card asgard-card">
                    <DialogHeader title="Manage Reports" callback={this.close.bind(this)}/>
                    <div className="card-body asgard-body">
                        <hr/>
                        <DialogFooter callback={this.close.bind(this)}/>
                    </div>
                </div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('Reports.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default Reports;