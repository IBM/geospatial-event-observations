/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React from 'react';
import MapGL from 'react-map-gl';
import PropTypes from 'prop-types';
import '../homepage.css';
import MapMarker from '../../../components/MapMarker';
import MapPopup from '../../../components/MapPopup';
//import CatalogPanel from './CatalogPanel';
//import EventsFilter from './EventsFilter';

const MapView = ({
        viewport,
        mapStyle,
        onViewportChange,
        dragToRotate,
        mapboxApiAccessToken,
        cityDetails,
        cities,
        onCityChange,
        showCitySelectionMenu,
        toggleCitySelectionMenu,
        //currentFilter,
        //onFilterChange,
        onContextMenu,
        onHover,
        events,
        mapPopups,
        onMarkerHover,
        onMarkerClick,
        closeMapPopup,
        openEventDetails,   
    }) => (
        <MapGL
            {...viewport}
            mapStyle={mapStyle}
            onViewportChange={onViewportChange}
            dragToRotate={dragToRotate}
            mapboxApiAccessToken={mapboxApiAccessToken}
            onContextMenu={onContextMenu}
            onHover={onHover}
        >
            {!showCitySelectionMenu && (
                <React.Fragment>
                    {/*<CatalogPanel />*/}
                    {/*<EventsFilter currentFilter={currentFilter} onFilterChange={onFilterChange} />*/}
                </React.Fragment>
            )}
            {events.map((event, i) => (
                <MapMarker event={event}
                            clickCallback={onMarkerClick}
                            hoverCallback={onMarkerHover} key={`mapMarker_${i}`}/>
            ))}
            {mapPopups.map((popup, i) => (
                <MapPopup event={popup} 
                            closeCallback={closeMapPopup}
                            detailsCallback={openEventDetails} key={`mapPopup_${i}`}/>
            ))}
        </MapGL>
    );

    MapView.propTypes = {
        viewport: PropTypes.object.isRequired,
        mapStyle: PropTypes.string.isRequired,
        onViewportChange: PropTypes.func.isRequired,
        dragToRotate: PropTypes.bool.isRequired,
        mapboxApiAccessToken: PropTypes.string.isRequired,
        onContextMenu: PropTypes.func.isRequired,
        onHover: PropTypes.func.isRequired,
        cityDetails: PropTypes.object.isRequired,
        cities: PropTypes.arrayOf(
            PropTypes.shape({
                city: PropTypes.string.isRequired,
                latitude: PropTypes.number.isRequired,
                longitude: PropTypes.number.isRequired,
                zoom: PropTypes.number.isRequired,
            })
        ).isRequired,
        onCityChange: PropTypes.func.isRequired,
        showCitySelectionMenu: PropTypes.bool.isRequired,
        toggleCitySelectionMenu: PropTypes.func.isRequired,
        currentFilter: PropTypes.string.isRequired,
        onFilterChange: PropTypes.func.isRequired,
        onMarkerHover: PropTypes.func.isRequired,
        onMarkerClick: PropTypes.func.isRequired,
        closeMapPopup: PropTypes.func.isRequired,
        openEventDetails: PropTypes.func.isRequired,
    };

export default MapView;
