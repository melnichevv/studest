import React from 'react';
import ReactDOM from 'react-dom';
// import { fromJS } from 'immutable';
import createHistory from 'history/createHashHistory';
import { syncHistoryWithStore } from 'react-router-redux';

import routes from './routes';
import Root from './Root';
import { configureStore } from './store/configureStore';

const initialState = {};

// // rehydrate initialState for JS app
// if (window.__INITIAL_STATE__) {
//   initialState = window.__INITIAL_STATE__;
//
//   // Transform into Immutable.js collections,
//   // but leave top level keys untouched for Redux
//   Object
//     .keys(initialState)
//     .forEach((key) => {
//       initialState[key] = fromJS(initialState[key]);
//     });
// }

const hashHistory = createHistory();

const { store, persistor } = configureStore(initialState, hashHistory);
console.warn(store, persistor);
const history = syncHistoryWithStore(hashHistory, store);

// Render the React application to the DOM
// Root component is to bootstrap Provider, Router and DevTools
ReactDOM.render(
  <Root history={history} routes={routes} store={store} persistor={persistor} />,
  document.getElementById('app-container')
);
