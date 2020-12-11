/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React from 'react';
import PropTypes from 'prop-types';
import '../../../App.css';

const CityMenuView = props => {
    if (!props.showMenu) {
        var cityMenuStyle = {
            top: "1rem",
            left: "50%",
            position: "absolute",
            zIndex: "5",
            transform: "translate(-50%, 0)"
        };

        return (
            <div style={cityMenuStyle}>
                <button className="btn btn-dark asgard-button" onClick={props.toggleMenu}>
                    {props.currentCity}
                </button>
            </div>
        );
    }

    return (
        <div className="homepage" style={{ height: '100vh' }}>
            <div className="row align-items-center h-100" style={{ margin: '0' }}>
                <div className="col-6 mx-auto">
                    <div id="availableLocations" className="card asgard-card">
                        <div className="card-header asgard-header">
                        <div class="asgard-card-header-item">Available Locations</div>
                        <div class="ml-auto asgard-card-header-item">
                            <a onClick={props.toggleMenu}>
                                <i class="fas fa-times fa-xs asgard-control"></i>
                            </a>
                        </div>
                        </div>
                        <div className="scrollable-block list-group list-group-flush">
                            {props.cities.map(city => (
                                <a
                                    key={city.city}
                                    className="list-group-item list-group-action"
                                    onClick={() => props.onCityChoosen(city)}
                                >
                                    {city.city}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

CityMenuView.propTypes = {
    showMenu: PropTypes.bool.isRequired,
    toggleMenu: PropTypes.func.isRequired,
    currentCity: PropTypes.string.isRequired,
    cities: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CityMenuView;
