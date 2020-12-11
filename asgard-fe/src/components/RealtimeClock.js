/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import '../css/navbar.css';

class RealtimeClock extends Component {
    state = {
        date: new Date(),
    };
  
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date(),
        });
    }

    render() {
        var realtimeClockStyle = {
            position: "absolute",
            top: "1rem",
            right: "1rem",
            //padding: "0.5rem",
            //margin: "0.5rem",
            backgroundColor: "transparent",
            color: "#fff",
            display: "inline-block",
            fontFamily: "sans-serif",
            fontSize: "1rem",
            textAlign: "left",
            zIndex: "4"
        };

        return (
            <div id="realtimeClock" style={realtimeClockStyle}>
                {//this.state.date.toUTCString()
                }
            </div>
        );
    }
}

export default RealtimeClock;
