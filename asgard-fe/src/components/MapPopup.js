/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import { Popup } from 'react-map-gl';

class MapPopup extends Component {
    constructor(props) {
        super(props);

        let initialEvent = {};
        if (props.event) {
            initialEvent = props.event;
        }

        this.state = {
            event: initialEvent,
        };

        this.close = this.close.bind(this);
        this.moreDetails = this.moreDetails.bind(this);
    }

    close() {
        this.props.closeCallback(this.state.event);
    }

    moreDetails() {
        // close the popup
        this.props.closeCallback(this.state.event);

        // open the Event details
        this.props.detailsCallback(this.state.event);
    }

    render() {
        return (
            <Popup closeButton={true}
                closeOnClick={false} 
                latitude={this.state.event.latitude}
                longitude={this.state.event.longitude}
                offsetTop={0}
                offsetLeft={0}
                onClose={this.close.bind(this)}>
                <div className="d-inline-flex">
                    <div className="p-1">
                        { (this.state.event.topImage !== -1) && (this.state.event.topImage !== '') ?
                            <div>
                                <img src={process.env.REACT_APP_API_ENDPOINT_URI + 'api/v1.0/images?img=' + encodeURIComponent(this.state.event.items[0].image_path)} 
                                    width="125" 
                                    alt={this.state.event.items[0].short_text}/>
                            </div>
                        :
                            <div className="d-flex asgard-map-popup-noimage">
                                <div className="m-auto">
                                    No image.
                                </div>
                            </div>
                        }
                    </div>
                    <div className="asgard-map-popup-text p-2">
                        <div>{this.state.event.items[0].short_text}</div>
                        <div className="asgard-map-popup-link">
                            <a title="More Details" onClick={this.moreDetails.bind(this)}>
                                More Details...
                            </a>
                        </div>
                    </div>
                </div>
            </Popup>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('MapPopup.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default MapPopup;