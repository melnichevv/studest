import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
// import example from './modules/example';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
  // example,
  routing,
  form: formReducer,
});
