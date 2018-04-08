import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import DevTools from '../containers/DevTools';
import { routerMiddleware } from 'react-router-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from '../reducers';

/**
 * Entirely optional, this tiny library adds some functionality to
 * your DevTools, by logging actions/state to your console. Used in
 * conjunction with your standard DevTools monitor gives you great
 * flexibility!
 */
const logger = createLogger();


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
  const persistConfig = {
    key: 'root',
    storage,
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = createStore(persistedReducer, initialState, enhancer);
  const persistor = persistStore(store);


  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')));
  }

  return { store, persistor };
};
