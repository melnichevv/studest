import { FETCH_DATA, FINISH_FETCH_DATA } from '../constants/ActionTypes';


export function fetchData() {
  return {
    type: FETCH_DATA,
  };
}

export function finishFetchData() {
  return {
    type: FINISH_FETCH_DATA,
  };
}
