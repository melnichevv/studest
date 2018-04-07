import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {HashRouter as Router} from 'react-router-dom';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {setContext} from 'apollo-link-context';
import {BatchHttpLink} from 'apollo-link-batch-http/lib/index';
import ApolloProvider from 'react-apollo/ApolloProvider';
import {Provider} from 'react-redux';

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
          {this.content}
        </Provider>
      </ApolloProvider>
    );
  }
}

Root.propTypes = {
  routes: PropTypes.element.isRequired,
  store: PropTypes.object.isRequired,
};
