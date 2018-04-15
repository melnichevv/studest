import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HashRouter as Router } from 'react-router-dom';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { BatchHttpLink } from 'apollo-link-batch-http/lib/index';
import ApolloProvider from 'react-apollo/ApolloProvider';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RingLoader } from 'react-spinners';

import 'bootstrap/dist/css/bootstrap.css';

const middlewareLink = setContext(() => ({
  headers: {
    authorization: `JWT ${localStorage.getItem('token')}` || '',
  },
}));
const httpLink = new BatchHttpLink({
  uri: 'http://0.0.0.0:8000/gql',
  credentials: 'same-origin',
});

const client = new ApolloClient({
  link: middlewareLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default class Root extends Component {
  get content() {
    return (
      <Router>
        {this.props.routes}
      </Router>
    );
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={this.props.store}>
          <PersistGate loading={<RingLoader color="#123abc" />} persistor={this.props.persistor}>
            {this.content}
          </PersistGate>
        </Provider>
      </ApolloProvider>
    );
  }
}

Root.propTypes = {
  routes: PropTypes.element.isRequired,
  store: PropTypes.object.isRequired,
  persistor: PropTypes.object.isRequired,
};
