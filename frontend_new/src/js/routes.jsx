import React from 'react';
import {
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';
import { Header } from './common/components/Header';

import '../assets/fonts/fonts.css';
import LoginView from './views/login';


const HeaderWithRouter = withRouter(props => <Header {...props} />);

module.exports = (
  <div className="container">
    <HeaderWithRouter />
    <hr />
    <div className="container__content">
      <Switch>
        <Route path="/login" component={LoginView} />
      </Switch>
    </div>
  </div>
);
