import React, { Component, Fragment } from 'react';

require('../../../style/index.css');

class IndexView extends Component {
  static propTypes = {};

  render() {
    return (
      <Fragment>
        <div>
          <h3>Application for user testing</h3>
          <div>
            This application was implemented using next technology stack
            <div>
              <h4>Backend:</h4>
              <ul>
                <li>
                  Python
                </li>
                <li>
                  Django Framework
                </li>
                <li>
                  Django Rest Framework
                </li>
                <li>
                  PostgreSQL
                </li>
                <li>
                  GraphQL
                </li>
              </ul>
            </div>
            <div>
              <h4>Frontend:</h4>
              <ul>
                <li>
                  React
                </li>
                <li>
                  Redux
                </li>
                <li>
                  Apollo
                </li>
                <li>
                  GraphQL
                </li>
              </ul>
            </div>
            <div>
              Author: Melnichenko Vladimir (2018)
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default IndexView;
