/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class DialogHeader extends Component {
    close() {
        this.props.callback();
    }

    render() {
        return (
            <div className="card-header asgard-header">
                <div className="asgard-card-header-item">{this.props.title}</div>
                <div className="ml-auto asgard-card-header-item">
                    <a onClick={this.close.bind(this)}>
                        <i className="fas fa-times fa-xs asgard-control"></i>
                    </a>
                </div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('DialogHeader.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default DialogHeader;