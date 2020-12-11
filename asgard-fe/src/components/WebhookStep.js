/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';

import Checkbox from './Checkbox';
import WebhookParam from './WebhookParam';

class WebhookStep extends Component {
    constructor(props) {
        super(props);

        let numericID = parseInt(props.id.substring(props.id.lastIndexOf('_')+1, props.id.length), 10);
        let thePrefix = props.id.substring(0, props.id.lastIndexOf('_'));

        let initialClass = 'tab-pane disposed';
        if (numericID === props.active) {
            initialClass = 'tab-pane active';
        }

        let initialChecked = false;
        if (props.responseHandledByEndpoint !== null && props.responseHandledByEndpoint) {
            initialChecked = true;
        }

        let initialRequestParams = [];
        if (props.requestParams !== null && props.requestParams.length) {
            initialRequestParams = props.requestParams;
        }

        let initialResponseParams = [];
        if (props.responseParams !== null && props.responseParams.length) {
            initialResponseParams = props.responseParams;
        }

        let initialStepStageActive = 'Request';
        if (props.stepStageActive !== null && props.stepStageActive === 'Response') {
            initialStepStageActive = props.stepStageActive;
        }

        this.state = {
            id: numericID,
            prefix: thePrefix,
            requestParams: initialRequestParams,
            responseParams: initialResponseParams,
            stepClass: initialClass,
            responseHandledByEndpoint: initialChecked,
            stepStageActive: initialStepStageActive,
        };

        this.addWebhookParam = this.addWebhookParam.bind(this);
        this.removeRequestParam = this.removeRequestParam.bind(this);
        this.removeResponseParam = this.removeResponseParam.bind(this);
        this.responseHandledByEndpoint = this.responseHandledByEndpoint.bind(this);
        this.updateRequestParam = this.updateRequestParam.bind(this);
        this.updateResponseParam = this.updateResponseParam.bind(this);
    }

    addWebhookParam(event) {
        const linkID = event.target.id && this.validString(event.target.id) ? event.target.id : event.target.parentElement.id;
        let paramType = (linkID.substring(0, linkID.lastIndexOf('_')));
        paramType = paramType.substring((paramType.lastIndexOf('_')+1));

        let newParam = ``;
        if (paramType === 'Request') {
            let temp = this.state.requestParams.slice(0);
            newParam = { 'param': '', 'paramValue': '', 'valueSecured': false, 'linkedParam': false };
            temp.push(newParam);
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Request_Param_'+this.state.requestParams.length}
                                            type="Request"
                                            param={newParam.param}
                                            paramValue={newParam.paramValue}
                                            valueSecured={newParam.valueSecured}
                                            linkedParam={newParam.linkedParam}
                                            updateCallback={this.updateRequestParam.bind(this)}
                                            removeCallback={this.removeRequestParam.bind(this)}/>, 
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Request_Container_' + this.state.requestParams.length)
            );
            this.setState({
                'requestParams': temp,
            });

            // callback to Datasources
            this.props.updateCallback(this.props.id, temp, this.state.responseParams, this.state.responseHandledByEndpoint, this.state.stepStageActive);
        } else {
            let temp = this.state.responseParams.slice(0);
            newParam = { 'param': '' };
            temp.push(newParam);
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Response_Param_'+this.state.responseParams.length}
                                            type="Response"
                                            param={newParam.param}
                                            updateCallback={this.updateResponseParam.bind(this)}
                                            removeCallback={this.removeResponseParam.bind(this)}/>,
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Response_Container_' + this.state.responseParams.length)
            );
            this.setState({
                'responseParams': temp,
            });

            // callback to Datasources
            this.props.updateCallback(this.props.id, this.state.requestParams, temp, this.state.responseHandledByEndpoint, this.state.stepStageActive);
        }
    }

    changeSubtab(event) {
        if (event.target.innerText !== this.state.stepStageActive) {
            const datasourcesManager = document.querySelector('#manageDatasources');
            let stepStageNav = datasourcesManager.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Nav');
            let selectedElements = stepStageNav.getElementsByClassName('active');
            [].forEach.call(selectedElements, function(selectedElement) {
                selectedElement.className = selectedElement.className.replace(/\b active\b/g, "");
            });

            // set the selected subtab
            if (this.state.stepStageActive === 'Request') {
                this.setState({
                    'stepStageActive': 'Response',
                });

                // callback to Datasources
                this.props.updateCallback(this.props.id, this.state.requestParams, this.state.responseParams, this.state.responseHandledByEndpoint, 'Response');
            } else {
                this.setState({
                    'stepStageActive': 'Request',
                });

                // callback to Datasources
                this.props.updateCallback(this.props.id, this.state.requestParams, this.state.responseParams, this.state.responseHandledByEndpoint, 'Request');
            }
        }
    }

    componentDidMount() {
        for (let i=0; i < this.state.requestParams.length; i++) {
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Request_Param_'+i}
                                            type="Request"
                                            param={this.state.requestParams[i].param}
                                            paramValue={this.state.requestParams[i].paramValue}
                                            valueSecured={this.state.requestParams[i].valueSecured}
                                            linkedParam={this.state.requestParams[i].linkedParam}
                                            updateCallback={this.updateRequestParam.bind(this)}
                                            removeCallback={this.removeRequestParam.bind(this)}/>, 
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Request_Container_' + i)
            );
        }

        for (let j=0; j < this.state.responseParams.length; j++) {
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Response_Param_'+j}
                                            type="Response"
                                            param={this.state.responseParams[j].param}
                                            updateCallback={this.updateResponseParam.bind(this)}
                                            removeCallback={this.removeResponseParam.bind(this)}/>, 
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Response_Container_' + j)
            );
        }

        if (this.props.active === this.state.id && this.state.stepClass === 'tab-pane disposed') {
            this.setState({
                'stepClass': 'tab-pane active',
            });
        } else if (this.props.active !== this.state.id && this.state.stepClass === 'tab-pane active') {
            this.setState({
                'stepClass': 'tab-pane disposed',
            });    
        }
    }

    componentDidUpdate() {
        for (let i=0; i < this.state.requestParams.length; i++) {
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Request_Param_'+i}
                                            type="Request"
                                            param={this.state.requestParams[i].param}
                                            paramValue={this.state.requestParams[i].paramValue}
                                            valueSecured={this.state.requestParams[i].valueSecured}
                                            linkedParam={this.state.requestParams[i].linkedParam}
                                            updateCallback={this.updateRequestParam.bind(this)}
                                            removeCallback={this.removeRequestParam.bind(this)}/>, 
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Request_Container_' + i)
            );
        }

        for (let j=0; j < this.state.responseParams.length; j++) {
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Response_Param_'+j}
                                            type="Response"
                                            param={this.state.responseParams[j].param}
                                            updateCallback={this.updateResponseParam.bind(this)}
                                            removeCallback={this.removeResponseParam.bind(this)}/>, 
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Response_Container_' + j)
            );
        }

        if (this.props.active === this.state.id && this.state.stepClass === 'tab-pane disposed') {
            this.setState({
                'stepClass': 'tab-pane active',
            });
        } else if (this.props.active !== this.state.id && this.state.stepClass === 'tab-pane active') {
            this.setState({
                'stepClass': 'tab-pane disposed',
            });    
        }
    }

    removeRequestParam(id) {
        for (let i=0; i < this.state.requestParams.length; i++) {
            ReactDOM.unmountComponentAtNode(document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Request_Container_'+i));
        }
        let temp = this.state.requestParams.slice(0);
        temp.splice(id, 1);
        for (let j=0; j < temp.length; j++) {
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Request_Param_'+j}
                                            type="Request"
                                            param={temp[j].param}
                                            paramValue={temp[j].paramValue}
                                            valueSecured={temp[j].valueSecured}
                                            linkedParam={temp[j].linkedParam}
                                            updateCallback={this.updateRequestParam.bind(this)}
                                            removeCallback={this.removeRequestParam.bind(this)}/>, 
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Request_Container_' + j)
            );
        }
        this.setState({
            'requestParams': temp,
        });

        // callback to Datasources
        this.props.updateCallback(this.props.id, temp, this.state.responseParams, this.state.responseHandledByEndpoint, this.state.stepStageActive);
    }

    removeResponseParam(id) {
        for (let i=0; i < this.state.responseParams.length; i++) {
            ReactDOM.unmountComponentAtNode(document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Response_Container_'+i));
        }
        let temp = this.state.responseParams.slice(0);
        temp.splice(id, 1);
        for (let j=0; j < temp.length; j++) {
            ReactDOM.render(
                <WebhookParam id={this.state.prefix + '_Step' + this.state.id + '_Response_Param_'+j}
                                            type="Response"
                                            param={temp[j].param}
                                            updateCallback={this.updateResponseParam.bind(this)}
                                            removeCallback={this.removeResponseParam.bind(this)}/>, 
                document.querySelector('#' + this.state.prefix + '_Step' + this.state.id + '_Response_Container_' + j)
            );
        }
        this.setState({
            'responseParams': temp,
        });

        // callback to Datasources
        this.props.updateCallback(this.props.id, this.state.requestParams, temp, this.state.responseHandledByEndpoint, this.state.stepStageActive);
    }

    render() {
        return (
            <div id={this.state.prefix + '_step' + this.state.id} className={this.state.stepClass}>
                <div className="d-flex">
                    <ul id={this.state.prefix + '_Step' + this.state.id + '_Nav'} className="nav nav-tabs">
                        <li className={'asgard-subsubtab' + (this.state.stepStageActive === 'Request' ? ' active' : '')}>
                            <a id={this.state.prefix + '_Step' + this.state.id + '_Request_Nav'} 
                                data-toggle="tab" 
                                href={'#' + this.state.prefix + '_Step' + this.state.id + '_Request'} 
                                onClick={this.changeSubtab.bind(this)}>
                                Request
                            </a>
                        </li>
                        <li className={'asgard-subsubtab' + (this.state.stepStageActive === 'Response' ? ' active' : '')}>
                            <a id={this.state.prefix + '_Step' + this.state.id + '_Response_Nav'}
                                data-toggle="tab"
                                href={'#' + this.state.prefix + '_Step' + this.state.id + '_Response'}
                                onClick={this.changeSubtab.bind(this)}>
                                Response
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="tab-content pt-1">
                    <div id={this.state.prefix + '_Step' + this.state.id + '_Request'} 
                            className={this.state.stepStageActive === 'Request' ? 'tab-pane active' : 'tab-pane'}>
                        <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Content'} className="asgard-scrollable-l scrollable-block">
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_0'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_1'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_2'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_3'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_4'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_5'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_6'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_7'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_8'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Request_Container_9'}></div>
                        </div>
                        <div className="d-flex">
                            <div className="ml-auto">
                                <hr className="my-1"/>
                                {this.state.requestParams.length < 10 ? 
                                    <a id={this.state.prefix + '_Step' + this.state.id + '_Request_Param'} title="Add a Parameter" onClick={this.addWebhookParam.bind(this)}>
                                        <i className="fas fa-plus-square asgard-control asgard-help"></i>
                                    </a>
                                :
                                    <i className="fas fa-plus-square asgard-help disabled"></i>
                                }
                            </div>
                        </div>
                    </div>
                    <div id={this.state.prefix + '_Step' + this.state.id + '_Response'}
                            className={this.state.stepStageActive === 'Response' ? 'tab-pane active' : 'tab-pane'}>
                        <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Content'} className="asgard-scrollable-l scrollable-block">
                            <Checkbox id={this.state.prefix + '_Step' + this.state.id + '_Response_Endpoint'} 
                                            callback={this.responseHandledByEndpoint.bind(this)}
                                            checked={this.state.responseHandledByEndpoint}
                                            label="Handled By Endpoint"/>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_0'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_1'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_2'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_3'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_4'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_5'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_6'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_7'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_8'}></div>
                            <div id={this.state.prefix + '_Step' + this.state.id + '_Response_Container_9'}></div>
                        </div>
                        <div className="d-flex">
                            <div className="ml-auto">
                                <hr className="my-1"/>
                                {this.state.responseParams.length < 10 ?
                                    <a id={this.state.prefix + '_Step' + this.state.id + '_Response_Param'} title="Add a Parameter" onClick={this.addWebhookParam.bind(this)}>
                                        <i className="fas fa-plus-square asgard-control asgard-help"></i>
                                    </a>
                                :
                                    <i className="fas fa-plus-square asgard-help disabled"></i>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    responseHandledByEndpoint(checked) {
        this.setState({
            'responseHandledByEndpoint': checked,
        });

        // callback to Datasources
        this.props.updateCallback(this.props.id, this.state.requestParams, this.state.responseParams, checked, this.state.stepStageActive);
    }

    static getDerivedStateFromError(error) {
        console.log('WebhookStep.GetDerivedStateFromError:');
        console.log(error);
    }

    updateRequestParam(id, param, paramValue, valueSecured, linkedParam) {
        let temp = this.state.requestParams.slice(0);
        const newParam = {
            'param': param,
            'paramValue': paramValue,
            'valueSecured': valueSecured,
            'linkedParam': linkedParam
        };
        temp[id] = newParam;
        this.setState({
            'requestParams': temp,
        });

        // callback to Datasources
        this.props.updateCallback(this.props.id, temp, this.state.responseParams, this.state.responseHandledByEndpoint, this.state.stepStageActive);
    }

    updateResponseParam(id, param) {
        let temp = this.state.responseParams.slice(0);
        const newParam = {
            'param': param
        };
        temp[id] = newParam;
        this.setState({
            'responseParams': temp,
        });

        // callback to Datasources
        this.props.updateCallback(this.props.id, this.state.requestParams, temp, this.state.responseHandledByEndpoint, this.state.stepStageActive);
    }
}

export default WebhookStep;