/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';

class LocationMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.close = this.close.bind(this);
    }

    close() {
        this.props.callbackFromApp();
    }

    render() {
        return (
            <div id="changeLocation" className={this.props.displayClass}>
                <div className="card asgard-card">
                    <DialogHeader title="Change Location" callback={this.close.bind(this)}/>
                    <div className="card-body asgard-body">
                        <div className="scrollable-block list-group list-group-flush">
                            {this.props.cities.map(city => (
                                <a
                                    key={city.city}
                                    className={this.props.selectedLocation.city === city.city ? 
                                        "list-group-item list-group-action asgard-list-group-item asgard-list-group-item-selected"
                                        : 
                                        "list-group-item list-group-action asgard-list-group-item"
                                    }
                                    onClick={() => this.props.changeLocation(city.city)}
                                >
                                    {city.city}
                                </a>
                            ))}
                        </div>
                        <hr/>
                        <DialogFooter callback={this.close.bind(this)}/>
                    </div>
                </div>
            </div>
        );
    }
    
    static getDerivedStateFromError(error) {
        console.log('Location.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default LocationMenu;