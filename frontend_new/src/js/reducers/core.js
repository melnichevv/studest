import { FETCH_DATA, FINISH_FETCH_DATA } from '../constants/ActionTypes';

export const fetchData = function (state, action) {
  console.warn('fetchData start', state);
  return Object.assign({}, state, {
    isFetching: true,
  });
};

export const finishFetchData = function (state, action) {
  console.warn('fetchData finish', state);
  return Object.assign({}, state, {
    isFetching: false,
  });
};

export default function app(state = {}, action = {}) {
  const types = {
    [FETCH_DATA]: fetchData,
    [FINISH_FETCH_DATA]: finishFetchData,
  };

  if (action.type in types) {
    return types[action.type](state, action);
  }

  return state;
}
