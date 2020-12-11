/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
import React from 'react';

export default props => (
  <div className="control-panel bottom-right">
    <div className="card">
      <form>
        <div className="form-row p-2">
          <div className="form-group col-md-6 m-0">
            <label className="form-check-label" htmlFor="defaultCheck1">
              Time Interval
            </label>
          </div>
          <div className="form-group col-md-6 m-0">
            <select className="form-control" value={props.currentFilter} onChange={props.onFilterChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  </div>
);
