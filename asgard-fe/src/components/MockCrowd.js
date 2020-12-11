/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class MockCrowd extends Component {
    render() {
        var crowdStyle = {
            position: "absolute",
            top: "calc((100vh / 2) - 10px)",
            left: "calc((100vw / 2) + 10px)",
            zIndex: "10",
            color: "rgb(200,0,0)",
            cursor: "pointer"
        };

        var cardHeaderStyle = {
            backgroundColor: "rgb(59,104,123)"
        };

        return (
            <div className="control-panel" style={crowdStyle}>
                <div className="card">
                    <div className="card-header p-2 text-center" style={cardHeaderStyle}>Coordinates: </div>
                    <div className="card-body">
                        <img src="/crowd.jpg" />
                    </div>
                </div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('MockCrowd.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default MockCrowd;