/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

import Checkbox from './Checkbox';
import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';
import ExpandableImage from './ExpandableImage';
import TableHeaderColumn from './TableHeaderColumn';

class Events extends Component {
    constructor(props) {
        super(props);

        this.state = {
            events: props.events,
            targetEvent: props.targetEvent,
            selectAll: false,
        };

        this.close = this.close.bind(this);
        this.collapseAll = this.collapseAll.bind(this);
        this.expand = this.expand.bind(this);
        this.getDOMRoot = this.getDOMRoot.bind(this);
        this.select = this.select.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.updateEventSorting = this.updateEventSorting.bind(this);
    }

    componentDidUpdate(prevProps) {
        if(this.props.targetEvent.id !== this.state.targetEvent.id) {
            console.log(this.props.targetEvent);
            // collapse everything else
            this.collapseAll();

            // expand the target
            this.expand(this.props.targetEvent.id);

            // save the new target
            this.setState({
                targetEvent: this.props.targetEvent,
            });
        }

        if (prevProps.events !== this.props.events) {
            this.setState({
                events: this.props.events,
            });
        }
    }
    
    close() {
        this.props.callbackFromApp('disposed');
    }

    collapseAll() {
        // const eventsManager = this.getDOMRoot();
        // collapse all
    }

    expand(targetID) {
        // const eventsManager = this.getDOMRoot();
        // expand target
        // console.log(targetID);
    }

    getDOMRoot() {
        return document.querySelector('#manageEvents');
    }

    render() {
        return (
            <div id="manageEvents" className={this.props.displayClass}>
                <div className="card asgard-card">
                    <DialogHeader title="Manage Events" callback={this.close.bind(this)}/>
                    <div className="card-body asgard-body">
                        <div className="mh-25vh asgard-scrollable">
                            <table className="w-100 asgard-table-body-noborder">
                                <thead>
                                    <tr>
                                        <th className="asgard-table-header-border asgard-table-header-end">
                                            <div className="d-flex">
                                                <div className="d-flex mx-1">
                                                    <Checkbox id="selectAll" 
                                                                callback={this.selectAll.bind(this)}
                                                                checked={this.state.selectAll}
                                                                label=""/>
                                                </div>
                                            </div>
                                        </th>
                                        <th className="asgard-table-header-border">
                                            <TableHeaderColumn label="Type" callback={this.updateEventSorting.bind(this)}/>
                                        </th>
                                        <th className="asgard-table-header-border">
                                            <TableHeaderColumn label="Severity" callback={this.updateEventSorting.bind(this)}/>
                                        </th>
                                        <th className="asgard-table-header-border">
                                            <TableHeaderColumn label="Date & Time" callback={this.updateEventSorting.bind(this)}/>
                                        </th>
                                        <th className="asgard-table-header-border">
                                            <TableHeaderColumn label="Location" callback={this.updateEventSorting.bind(this)}/>
                                        </th>
                                        <th className="asgard-table-header-border asgard-table-header-end">
                                            <div className="d-flex">
                                                <div className="d-flex mx-1">
                                                    <div className="d-inline-flex">
                                                        {this.state.events.length > 0 ?
                                                            <i className="fas fa-ellipsis-v align-middle px-1 asgard-menu-icon"></i>
                                                        :
                                                            <i className="fas fa-ellipsis-v align-middle px-1 asgard-menu-icon disabled"></i>
                                                        }
                                                    </div>
                                                    <div className="d-inline-flex">
                                                        {this.state.events.length > 0 ?
                                                            <i className="fas fa-filter align-middle px-1 asgard-menu-icon"></i>
                                                        :
                                                            <i className="fas fa-filter align-middle px-1 asgard-menu-icon disabled"></i>
                                                        }
                                                    </div>
                                                    <div className="d-inline-flex">
                                                        {this.state.events.length > 0 ?
                                                            <i className="fas fa-search align-middle px-1 asgard-menu-icon"></i>
                                                        :
                                                            <i className="fas fa-search align-middle px-1 asgard-menu-icon disabled"></i>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                { this.state.events.length > 0 ? this.state.events.map((event, i) => (
                                    <tbody className="asgard-table-body-noborder" key={`eventTable_${i}`}>
                                        <tr className={i % 2 === 0 ? 'py-2 asgard-table-row even' : 'py-2 asgard-table-row odd'}>
                                            <td className="asgard-table-cell">
                                                <div className="d-flex">
                                                    <div className="d-flex mx-1">
                                                        <Checkbox id={`select_${i}`} 
                                                                    callback={this.select.bind(this)}
                                                                    checked={false}
                                                                    label=""/>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="asgard-table-cell clickable">
                                                <div className="d-flex">
                                                    <div className="m-auto">
                                                        <a id={`event_${i}`} className="asgard-link" onClick={this.showEventDetails.bind(this)}>
                                                            {event.name}&nbsp;
                                                        </a>
                                                    </div>
                                                    <div className="m-auto">
                                                        { event.iconType === 'font-awesome' ?
                                                            <i className={event.iconClass}></i>
                                                        :
                                                            <div>
                                                                <img src={event.iconClass} alt={event.name}
                                                                        width={event.iconWidth} height={event.iconHeight}/>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="asgard-table-cell clickable">
                                                <div className="d-flex">
                                                    <div className="m-auto">
                                                        {event.severity}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="asgard-table-cell clickable">
                                                <div className="d-flex">
                                                    <div className="m-auto">
                                                        {event.date}&nbsp;{event.time}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="asgard-table-cell clickable">
                                                <div className="d-flex">
                                                    <div className="m-auto">
                                                        {`Lat: ${this.roundFour(event.latitude)}, Long: ${this.roundFour(event.longitude)}`}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="asgard-table-cell clickable">
                                                <div className="d-flex">
                                                    <div className="m-auto">
                                                        <i id={`caret_${i}`} className="fas fa-caret-right" onClick={this.showEventDetails.bind(this)}></i>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="7">
                                                <table  id={`eventDetails_${i}`} className="mx-auto w-90 disposed">
                                                    { event.items.length > 0 ? (
                                                        <thead>
                                                            <tr>
                                                                <th className="asgard-subtable-header-border px-1">
                                                                    <div className="d-flex"><p className="m-auto">Image</p></div>
                                                                </th>
                                                                <th className="asgard-subtable-header-border px-1">
                                                                    <div className="d-flex"><p className="m-auto">Text</p></div>
                                                                </th>
                                                                <th className="asgard-subtable-header-border px-1">
                                                                    <div className="d-flex"><p className="m-auto">Time</p></div>
                                                                </th>
                                                                <th className="asgard-subtable-header-border px-1">
                                                                    <div className="d-flex"><p className="m-auto">Location</p></div>
                                                                </th>
                                                                <th className="asgard-subtable-header-border px-1">
                                                                    <div className="d-flex"><p className="m-auto">Score</p></div>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                    ):(
                                                        <thead></thead>
                                                    )}
                                                    <tbody>
                                                        { event.items.length > 0 ? event.items.map((eventItem, i) => (
                                                            <tr className={i % 2 === 0 ? 'asgard-table-row even' : 'asgard-table-row odd'} key={`eventRow_${i}`}>
                                                                <td className="p-2">
                                                                    <ExpandableImage src={eventItem.image_path} width="60"/>
                                                                </td>
                                                                <td className="p-2">
                                                                    {eventItem.short_text}
                                                                </td>
                                                                <td className="p-2">
                                                                    {eventItem.time.split('T')[0] + ' ' + eventItem.time.split('T')[1]}
                                                                </td>
                                                                <td className="p-2">
                                                                    {`Lat: ${this.roundFour(eventItem.latitude)}, Long: ${this.roundFour(eventItem.longitude)}`}
                                                                </td>
                                                                <td className="asgard-text-centered p-2">
                                                                    {this.roundFour(eventItem.score)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                        :
                                                            <tr className="asgard-table-row">
                                                                <td colspan="7" className="asgard-table-cell asgard-help disabled align-middle pt-2">
                                                                    <div className="odd">
                                                                        No Event Items detected.
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                ))
                                :
                                    <tbody className="asgard-table-body">
                                        <tr className="asgard-table-row">
                                            <td colSpan="7" className="asgard-table-cell asgard-help disabled align-middle pt-2">
                                                <div className="odd">
                                                    No events detected.
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                }
                            </table>
                        </div>
                        <hr/>
                        <DialogFooter callback={this.close.bind(this)}/>
                    </div>
                </div>
            </div>
        );
    }

    roundFour(aNumber) {
        return Math.round((aNumber + Number.EPSILON) * 10000) / 10000;
    }

    select() {

    }

    selectAll() {

    }

    showEventDetails(event) {
        event.stopPropagation();
        const targetID = parseInt(event.target.id.split('_')[1], 10);
        const eventsManager = this.getDOMRoot();
        
        // switch caret down
        let targetCaret = eventsManager.querySelector(`#caret_${targetID}`);
        if (targetCaret.className === 'fas fa-caret-right') {
            targetCaret.className = targetCaret.className.replace(/\bright\b/g, 'down');
        } else {
            targetCaret.className = targetCaret.className.replace(/\bdown\b/g, 'right');
        }

        let targetEvent = eventsManager.querySelector(`#eventDetails_${targetID}`);
        if (targetEvent.className.indexOf('disposed') !== -1) {
            targetEvent.className = targetEvent.className.replace(/\b disposed\b/g, "");
        } else {
            targetEvent.className = targetEvent.className + ' disposed';
        }
    }

    sortByType(a, b) {
        let typeA = a.name.toUpperCase();
        let typeB = b.name.toUpperCase();
        if (typeA > typeB) {
            return 1;
        }
        if (typeA < typeB) {
            return -1;
        }
        return 0;
    }

    sortBySeverity(a, b) {
        let sevA = a.severity;
        let sevB = b.severity;
        if (sevA > sevB) {
            return 1;
        }
        if (sevA < sevB) {
            return -1;
        }
        return 0;
    }

    sortByDateTime(a, b) {
        let dateA = Date.parse(`${a.date}T${a.time}:00`);
        let dateB = Date.parse(`${b.datw}T${b.time}:00`);
        if (dateA > dateB) {
            return 1;
        }
        if (dateA < dateB) {
            return -1;
        }
        return 0;
    }

    sortByLocation(a, b) {
        let locA = a.longitude;
        let locB = b.longitude;
        if (locA > locB) {
            return 1;
        }
        if (locA < locB) {
            return -1;
        }
         return 0;
    }

    static getDerivedStateFromError(error) {
        console.log('Events.GetDerivedStateFromError:');
        console.log(error);
    }

    updateEventSorting(type, sort) {
        let sortFunction = null;
        switch(type) {
            case 'Type':
                sortFunction = this.sortByType;
                break;
            case 'Severity':
                sortFunction = this.sortBySeverity;
                break;
            case 'Date & Time':
                sortFunction = this.sortByDateTime;
                break;
            case 'Location':
                sortFunction = this.sortByLocation;
                break;
            default:
                break;
        }

        if (sortFunction !== null) {
            let temp = this.state.events;
            temp.sort(sortFunction);
            if (sort === 'dsc') {
                temp.reverse();
            }
            this.setState({
                events: temp,
            });
        }
    }
}

export default Events;