/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import '../css/Logo.css';

class Logo extends Component {
    //sidebarMenuActive = false;

    toggleMenu() {
        this.props.callbackFromApp();
    }

    render() {
        return (
            <img id="logo" className={this.props.className} 
                    src='/asgard.png' 
                    width='96px' 
                    height='96px'
                    alt='Asgard Menu Toggle' 
                    onClick={this.toggleMenu.bind(this)}/>
        );
    }

    static getDerivedStateFromError(error) {
        console.log('Logo.GetDerivedStateFromError:');
        console.log(error);
    }
}

export default Logo;