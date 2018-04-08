import React from 'react';
import {
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';
import { Header } from './common/components/Header';

import '../assets/fonts/fonts.css';
import LoginView from './views/login';
import TestsView from './views/tests';


const HeaderWithRouter = withRouter(props => <Header {...props} />);

module.exports = (
  <div className="container">
    <HeaderWithRouter />
    <hr />
    <div className="container__content">
      <Switch>
        <Route path="/login" component={LoginView} />
        <Route path="/tests" component={TestsView} />
      </Switch>
    </div>
  </div>
);
