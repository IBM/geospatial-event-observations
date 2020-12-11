/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class TableHeaderColumn extends Component {
    constructor(props) {
        super(props);

        let initialLabel = '';
        if (props.label !== null) {
            initialLabel = props.label;
        }

        let initialSort = '';
        if (props.sort !== null && props.sort !== undefined) {
            initialSort = props.sort;
        }

        this.state = {
            headerClass: 'd-flex asgard-table-header',
            label: initialLabel,
            sort: initialSort,
            sortTypes: ['', 'asc', 'dsc'],
        };

        this.click = this.click.bind(this);
    }

    click(event) {
        event.stopPropagation();

        let newSort = this.state.sort;
        switch(this.state.sort) {
            case this.state.sortTypes[0]:
                newSort = this.state.sortTypes[1];
                break;
            case this.state.sortTypes[1]:
                newSort = this.state.sortTypes[2];
                break;
            case this.state.sortTypes[2]:
                newSort = this.state.sortTypes[0];
                break;
            default:
                newSort = this.state.sortTypes[0];
                break;
        }

        this.setState({
            'sort': newSort,
        });

        // callback
        this.props.callback(this.state.label, newSort);
    }

    render() {
        return (
            <div className={this.state.headerClass} onClick={this.click.bind(this)}>
                <div className="ml-auto">
                    {this.state.label}
                </div>
                <div className="pl-1 mr-auto">
                    { this.state.sort === '' ?
                        <i className="fas fa-sort"></i>
                    :
                        this.state.sort === 'asc' ? <i className="fas fa-sort-up"></i> : <i className="fas fa-sort-down"></i>
                    }
                </div>
            </div>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('TableHeaderColumn.GetDerivedStateFromError:');
        console.log(error);
    }

    validString(aString) {
        return aString && aString !== '' && (/\S/g).test(aString);
    }
}

export default TableHeaderColumn;