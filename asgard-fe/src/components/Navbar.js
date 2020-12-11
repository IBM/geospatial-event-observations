/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/navbar.css';

class Navbar extends Component {
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
    return (
      <nav className="navbar navbar-expand-lg navbar-bg-color navbar-lg navbar-dark">
        <Link to="/" className="navbar-brand">
          Event Detector
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="ml-auto navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/logout">
                {this.state.date.toUTCString()}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
