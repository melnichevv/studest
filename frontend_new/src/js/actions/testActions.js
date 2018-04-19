import { SAVE_ANSWER } from '../constants/ActionTypes';


export function saveAnswer(question, answer) {
  return {
    type: SAVE_ANSWER,
    question,
    answer,
  };
}

export function saveAnswerLocally(question, answer) {
  return async (dispatch, getState) => {
    const { state } = getState();
    console.warn('state in saveAnswer', state);
    console.warn('params in saveAnswer', { question, answer });
    dispatch(saveAnswer(question, answer));
  };
}
//
// export function callRemoveSelection(question, value) {
//   return async (dispatch, getState) => {
//     const { state } = getState();
//     console.warn('state in callremoveSelection', state);
//     console.warn('params in callremoveSelection', { question, value });
//     dispatch(removeSelection(question, value));
//   };
// }
