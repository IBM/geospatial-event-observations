/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class DialogFooter extends Component {
    close() {
        this.props.callback();
    }

    render() {
        return (
            <div className="asgard-body-item">
                <div></div>
                <div className="ml-auto">
                    <button className="btn btn-dark asgard-button" title="Done" onClick={this.close.bind(this)}>Done</button>
                </div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('DialogFooter.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default DialogFooter;