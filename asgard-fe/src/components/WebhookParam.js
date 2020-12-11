/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';

class WebhookParam extends Component {
    constructor(props) {
        super(props);
        
        const targetIndex = props.id !== null ? 
            parseInt(props.id.substring(props.id.lastIndexOf('_') + 1),10) : -1;

        const parentId = props.id !== null ?
            parseInt(props.id.split('p')[1].substring(0,props.id.split('p')[1].indexOf('_')), 10): -1;

        this.state = {
            id: targetIndex,
            parentId: parentId,
            class: 'd-inline-flex pb-1',
            param: props.param !== null ? props.param : '',
            paramValue: props.paramValue !== null ? props.paramValue : '',
            type: props.type !== null ? props.type : 'Request',
            valueSecured: props.valueSecured !== null ? props.valueSecured : false,
            linkedParam: props.linkedParam !== null ? props.linkedParam : false,
        };

        this.link = this.link.bind(this);
        this.remove = this.remove.bind(this);
        this.secure = this.secure.bind(this);
    }

    link(event) {
        event.stopPropagation();
        const linked = !this.state.linkedParam;
        this.setState({
            'paramValue': '',
            'linkedParam': linked,
            'valueSecured': linked,
        });
        this.props.updateCallback(this.state.id,
            this.state.param,
            '',
            linked, linked);
    }

    remove(event) {
        event.stopPropagation();
        this.props.removeCallback(this.state.id);
    }

    render() {
        const newRequest = <div id={this.props.id} ref={this.props.id} className="d-inline-flex pb-1">    
                <div>
                    <input className="input-sm" type="text" value={this.state.param} onChange={this.updateParam.bind(this)}/>
                </div>        
                <div className="px-1">
                    =
                </div>
                <div>
                    {this.state.linkedParam ?
                        <input className="input-sm" type="text" value="" disabled/>
                    :
                        <div>
                            {this.state.valueSecured ? 
                                <input className="input-sm" type="password" value={this.state.paramValue} onChange={this.updateParamValue.bind(this)}/>
                            :
                                <input className="input-sm" type="text" value={this.state.paramValue} onChange={this.updateParamValue.bind(this)}/>
                            }
                        </div>
                    }
                </div>
                <div className="pl-1 my-auto">
                    {this.state.linkedParam ?
                        <a title="Secure Value">
                            <i className="fas fa-lock asgard-help"></i>
                        </a>    
                    :
                        <a title="Secure Value" onClick={this.secure.bind(this)}>
                        {this.state.valueSecured ?
                            <i className="fas fa-lock asgard-control asgard-help"></i>
                        :
                            <i className="fas fa-unlock-alt asgard-control asgard-help"></i>
                        }
                        </a>
                    }
                </div>
                { this.state.parentId > 1 ?
                    <div className="pl-1 my-auto">
                        <a title="Link to Previous Step" onClick={this.link.bind(this)}>
                        {this.state.linkedParam ?
                            <i className="fas fa-link asgard-control asgard-help"></i>
                        :
                            <i className="fas fa-unlink asgard-control asgard-help"></i>
                        }
                        </a>
                    </div>
                :
                    <div></div>
                }
                <div className="pl-1 my-auto">
                    <a title="Remove Parameter" onClick={this.remove.bind(this)}>
                        <i className="fas fa-minus-square asgard-control asgard-help remove-param"></i>
                    </a>
                </div>
            </div>;

        const newResponse = <div id={this.props.id} className="pb-1">
                <div className="d-inline-flex">
                    <div>
                        <input className="input-sm" type="text" value={this.state.param} onChange={this.updateParam.bind(this)}/>
                    </div>
                    <div className="pl-1 my-auto">
                        <a title="Remove Parameter" onClick={this.remove.bind(this)}>
                            <i className="fas fa-minus-square asgard-control asgard-help remove-param"></i>
                        </a>
                    </div>
                </div>
            </div>;
        const paramType = this.props.type;
        return(
            (paramType === 'Request') ? newRequest : newResponse
        );
    }

    secure() {
        const secured = !this.state.valueSecured;
        this.setState({
            'valueSecured': secured,
        });
        this.props.updateCallback(this.state.id,
            this.state.param,
            this.state.paramValue,
            secured,
            this.state.linkedParam);
    }

    updateParam(event) {
        event.stopPropagation();
        this.setState({
            'param': event.target.value,
        });
        if (this.state.type === 'Request') {
            this.props.updateCallback(this.state.id,
                event.target.value,
                this.state.paramValue,
                this.state.valueSecured,
                this.state.linkedParam);
        } else {
            this.props.updateCallback(this.state.id,
                event.target.value);
        }
    }

    updateParamValue(event) {
        event.stopPropagation();
        this.setState({
            'paramValue': event.target.value,
        });
        this.props.updateCallback(this.state.id,
            this.state.param,
            event.target.value,
            this.state.valueSecured,
            this.state.linkedParam);
    }

    static getDerivedStateFromError(error) {
        console.log('WebhookParam.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default WebhookParam;