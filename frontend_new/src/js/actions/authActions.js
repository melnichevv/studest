import { LOGIN, LOGIN_FAILED } from '../constants/ActionTypes';
import { fetchData, finishFetchData } from './coreActions';

export function processLogin(token, user) {
  return {
    type: LOGIN,
    token,
    user,
  };
}

export function failedLogin(res) {
  return {
    type: LOGIN_FAILED,
    res,
  };
}

export function login(params, history) {
  return async (dispatch, getState) => {
    const { state } = getState();
    console.warn('state in login', state);
    console.warn('params in login', params);

    dispatch(fetchData());

    const url = 'http://0.0.0.0:8000/api-token-auth/';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: params.username,
        password: params.password,
      }),
    });
    const responseBody = await response.json();
    console.warn('responseBody', responseBody);
    if (responseBody.token && responseBody.user) {
      dispatch(processLogin(responseBody.token, responseBody.user));
      history.push('/');
    } else {
      dispatch(failedLogin(responseBody));
    }

    dispatch(finishFetchData());
  };
}
