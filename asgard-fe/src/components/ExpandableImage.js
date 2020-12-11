/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class ExpandableImage extends Component {
    constructor(props) {
        super(props);

        let initialSrc = '';
        if (props.src) {
            initialSrc = props.src;
        }

        let initialWidth = -1;
        if (props.width) {
            initialWidth = props.width;
        }

        this.state = {
            src: initialSrc,
            width: initialWidth,
            isOver: false,
            showExpandedVersion: false,
            expandedClass: 'asgard-manager disposed'
        };

        this.close = this.close.bind(this);
        this.enter = this.enter.bind(this);
        this.leave = this.leave.bind(this);
        this.open = this.open.bind(this);
        this.shouldOpen = this.shouldOpen.bind(this);
    }

    close() {

    }

    enter() {
        this.setState({
            isOver: true,
        }, this.shouldOpen);
    }

    leave() {
        this.setState({
            isOver: false,
            expandedClass: 'asgard-manager disposed',
        });
    }

    open() {
        console.log('Opening...');
        if (!this.state.isOver) {
            this.setState({
                isOver: !this.state.isOver,
                expandedClass: 'asgard-manager'
            });
        } else {
            this.leave();
        }
    }

    render() {
        // onMouseEnter={this.enter.bind(this)}
        // onMouseLeave={this.leave.bind(this)}
        return (
            <div className="d-flex">
            { this.state.src && this.state.src !== '' ? (
                <div className="d-flex">
                    <img src={process.env.REACT_APP_API_ENDPOINT_URI + 'api/v1.0/images?img=' + encodeURIComponent(this.state.src)} 
                        width={this.state.width}
                        onClick={this.open.bind(this)}
                        className="m-auto clickable"
                        alt="Normal"/>
                    <div className={this.state.expandedClass}
                            onClick={this.leave.bind(this)}>
                        <img src={process.env.REACT_APP_API_ENDPOINT_URI + 'api/v1.0/images?img=' + encodeURIComponent(this.state.src)} className="clickable" alt="Expanded"/>
                    </div>
                </div>
            ) : (
                <img src="no_image.png" width={this.state.width} alt=""/> 
            )}
            </div>
        );
    }

    shouldOpen() {
        console.log('ShouldOpen...');
            setTimeout(() => {
                if (this.state.isOver) {
                    this.open();
                }
            },
            3000);
    }

    static getDerivedStateFromError(error) {
        console.log('ExpandableImage.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default ExpandableImage;