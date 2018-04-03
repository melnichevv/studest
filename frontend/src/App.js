import React, {Component} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
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
import TestsView from './views/tests/ListView'

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
console.warn('localStorage', localStorage);

const token = localStorage.token;

class App extends Component {
    render() {
        return (
            <ApolloProvider client={client}>
                <Router>
                    <div>
                        <Nav>
                            <NavItem>
                                <NavLink href="/">Home</NavLink>
                            </NavItem>
                            {
                                token &&
                                <NavItem>
                                    <NavLink href="/tests/">Tests</NavLink>
                                </NavItem>
                            }
                            {
                                token &&
                                <NavItem>
                                    <NavLink href="/logout">Logout</NavLink>
                                </NavItem>
                            }
                            {
                                !token &&
                                <NavItem>
                                    <NavLink href="/login">Login</NavLink>
                                </NavItem>
                            }
                        </Nav>
                        <Route exact path="/" component={ListView}/>
                        <Route exact path="/login/" component={LoginView}/>
                        <Route exact path="/logout/" component={LogoutView}/>
                        <Route exact path="/tests/" component={TestsView}/>
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