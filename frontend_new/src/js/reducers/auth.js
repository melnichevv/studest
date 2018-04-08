import { LOGIN, LOGIN_FAILED, UNAUTHORIZE } from '../constants/ActionTypes';

export const loginUser = function (state, action) {
  console.warn('loginUser', state);
  console.warn('loginUser', action);
  return Object.assign({}, state, {
    isFetching: true,
    lastUpdated: Date.now(),
    token: action.token,
    user: action.user,
  });
};


export const loginFailed = function (state, action) {
  console.warn('loginFailed', state);
  console.warn('loginFailed', action);
  return Object.assign({}, state, {
    token: null,
    user: null,
  });
};

export const unsetCurrentUser = function (state, action) {
  return Object.assign({}, state, {
    token: null,
    user: null,
  });
};


export default function app(state = {}, action = {}) {
  const types = {
    [LOGIN]: loginUser,
    [LOGIN_FAILED]: loginFailed,
    [UNAUTHORIZE]: unsetCurrentUser,
  };

  if (action.type in types) {
    return types[action.type](state, action);
  }

  return state;
}
