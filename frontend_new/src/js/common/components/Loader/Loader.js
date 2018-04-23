import React, { Component } from 'react';
import { PacmanLoader } from 'react-spinners';

import './Loader.css';

class Loader extends Component {
  static propTypes = {
  };

  render() {
    return (
      <div className="loader">
        <h2>Loading. Please wait...</h2>
        <div className="spinner">
          <PacmanLoader color="#123abc" />
        </div>
      </div>
    );
  }
}

export default Loader;
