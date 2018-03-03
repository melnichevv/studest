import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';

import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloProvider} from 'react-apollo';
import {setContext} from 'apollo-link-context';

import CreateView from './views/CreateView'
import DetailView from './views/DetailView'
import ListView from './views/ListView'
import LoginView from './views/LoginView'
import LogoutView from './views/LogoutView'

import './App.css';
import {BatchHttpLink} from "apollo-link-batch-http/lib/index";

const middlewareLink = setContext(() => ({
    headers: {
        authorization: `JWT ${localStorage.getItem('token')}` || '',
    }
}));
const httpLink = new BatchHttpLink({uri: "http://0.0.0.0:8000/gql", credentials: 'same-origin'});

const client = new ApolloClient({
    link: middlewareLink.concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: true,
});
console.warn('client', client);

class App extends Component {
    render() {
        return (
            <ApolloProvider client={client}>
                <Router>
                    <div>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/messages/create/">Create Message</Link></li>
                            <li><Link to="/login/">Login</Link></li>
                            <li><Link to="/logout/">Logout</Link></li>
                        </ul>
                        <Route exact path="/" component={ListView}/>
                        <Route exact path="/login/" component={LoginView}/>
                        <Route exact path="/logout/" component={LogoutView}/>
                        <Switch>
                            <Route path="/messages/create/" component={CreateView}/>
                            <Route path="/messages/:id/" component={DetailView}/>
                        </Switch>
                    </div>
                </Router>
            </ApolloProvider>
        )
    }
}

export default App