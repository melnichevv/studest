import React from 'react';
import {
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';
import { Header } from './common/components/Header';

import '../assets/fonts/fonts.css';
import LoginView from './views/login';
import RegisterView from './views/register';
import TestsView from './views/tests';
import TestDetailsView from './views/tests/TestDetailsView';
import TestAdminDetailsView from './views/tests/TestAdminDetailsView';
import TestPreView from './views/tests/TestPreView';
import IndexView from './views/index';


const HeaderWithRouter = withRouter(props => <Header {...props} />);

module.exports = (
  <div className="container">
    <HeaderWithRouter />
    <hr />
    <div className="container__content">
      <Switch>
        <Route path="/login" component={LoginView} />
        <Route path="/register" component={RegisterView} />
        <Route path="/tests/:uuid/details/" component={TestDetailsView} />
        <Route path="/tests/:uuid/admin/" component={TestAdminDetailsView} />
        <Route path="/tests/:uuid/pre/" component={TestPreView} />
        <Route path="/tests" component={TestsView} />
        <Route path="/" component={IndexView} />
      </Switch>
    </div>
  </div>
);
