import { FETCH_DATA, FINISH_FETCH_DATA, SAVE_SEARCH } from '../constants/ActionTypes';


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

export function saveSearch(search) {
  return {
    type: SAVE_SEARCH,
    search,
  };
}
