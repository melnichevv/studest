import { FETCH_DATA, FINISH_FETCH_DATA, SAVE_SEARCH } from '../constants/ActionTypes';

export const fetchData = function (state) {
  console.warn('fetchData start', state);
  return Object.assign({}, state, {
    isFetching: true,
  });
};

export const finishFetchData = function (state) {
  console.warn('fetchData finish', state);
  return Object.assign({}, state, {
    isFetching: false,
  });
};

export const saveSearch = function (state, action) {
  return Object.assign({}, state, {
    search: action.search,
  });
};

export default function app(state = {}, action = {}) {
  const types = {
    [FETCH_DATA]: fetchData,
    [FINISH_FETCH_DATA]: finishFetchData,
    [SAVE_SEARCH]: saveSearch,
  };

  if (action.type in types) {
    return types[action.type](state, action);
  }

  return state;
}
