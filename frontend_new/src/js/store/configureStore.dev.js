import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import DevTools from '../containers/DevTools';
import {routerMiddleware} from "react-router-redux";

/**
 * Entirely optional, this tiny library adds some functionality to
 * your DevTools, by logging actions/state to your console. Used in
 * conjunction with your standard DevTools monitor gives you great
 * flexibility!
 */
const logger = createLogger();

// const finalCreateStore = compose(
//   // Middleware you want to use in development:
//   applyMiddleware(logger, thunk),
//   // Required! Enable Redux DevTools with the monitors you chose
//   DevTools.instrument()
// )(createStore);

module.exports = function configureStore(initialState, history) {
  const enhancer = compose(
    // Middleware you want to use in development:
    applyMiddleware(
      thunk,
      routerMiddleware(history)
    ),
    // Required! Enable Redux DevTools with the monitors you chose
    // window.devToolsExtension ? window.devToolsExtension() : f => f
    DevTools.instrument()
  );
  // const store = finalCreateStore(rootReducer, initialState, enhancer);
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')));
  }

  return store;
};
