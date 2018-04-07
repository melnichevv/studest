import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'react-router-redux';
import {
  applyMiddleware,
  compose,
  createStore,
} from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import sagas from './sagas';
import rootReducer from './rootReducers';
import DevTools from '../containers/DevTools';

// Redux DevTools Extension for Chrome and Firefox
const reduxDevTool = () => {
  return typeof window === 'object' &&
  typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f;
};

const logger = createLogger();

const finalCreateStore = compose(
  // Middleware you want to use in development:
  applyMiddleware(logger, thunk),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument()
)(createStore);

module.exports = function configureStore(initialState) {
  const store = finalCreateStore(rootReducer, initialState);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')));
  }

  return store;
};

//
// export default function configureStore(initialState, history) {
//   const sagaMiddleware = createSagaMiddleware();
//
//   const middleware = applyMiddleware(sagaMiddleware, routerMiddleware(history));
//
//   const composedStoreEnhancer = compose(middleware, reduxDevTool());
//
//   const store = composedStoreEnhancer(createStore)(rootReducer, initialState);
//
//   sagaMiddleware.run(sagas);
//
//   if (module.hot) {
//     module.hot.accept('./rootReducers', () => {
//       store.replaceReducer(require('./rootReducers'));
//     });
//   }
//
//   return store;
// }
