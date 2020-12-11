/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import { Marker } from 'react-map-gl';

class MapMarker extends Component {
    constructor(props) {
        super(props);

        let initialEvent = {};
        if (props.event) {
            initialEvent = props.event;
        }

        this.state = {
            event: initialEvent,
            severityClasses: ['asgard-map-marker-highest',
                                'asgard-map-marker-high',
                                'asgard-map-marker-medium',
                                'asgard-map-marker-low',
                                'asgard-map-marker-lowest'],
        };

        this.click = this.click.bind(this);
        this.hoverEnter = this.hoverEnter.bind(this);
        this.hoverLeave = this.hoverLeave.bind(this);
    }

    click(event) {
        event.stopPropagation();
        // callback
        this.props.clickCallback(this.state.event);
    }

    hoverEnter(event) {
        event.stopPropagation();
        console.log('Hovering on:');
        console.log(event);
        console.log(this.state.event);

        // callback
        this.props.hoverCallback(1, this.state.event);
    }

    hoverLeave(event) {
        event.stopPropagation();
        console.log('Leaving on:');
        console.log(event);
        console.log(this.state.event);

        // callback
        this.props.hoverCallback(0, this.state.event);
    }

    render() {
        return (
            <Marker latitude={this.state.event.latitude}
                    longitude={this.state.event.longitude}
                    offsetTop={-(this.state.event.iconHeight / 2)}
                    offsetLeft={-(this.state.event.iconWidth / 2)}>
                { this.state.event.iconType === 'font-awesome' ?
                    <i className={`${this.state.event.iconClass} ${this.state.severityClasses[this.state.event.severity - 1]}`} 
                            onClick={this.click.bind(this)}>
                    </i>
                :
                    <div className={this.state.severityClasses[this.state.event.severity - 1]} 
                            onClick={this.click.bind(this)}>
                        <img src={this.state.event.iconClass} alt={this.state.event.name}
                            width={this.state.event.iconWidth} height={this.state.event.iconHeight}/>
                    </div>
                }
            </Marker>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('MapMarker.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default MapMarker;