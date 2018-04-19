import { SAVE_ANSWER } from '../constants/ActionTypes';

export const saveAnswer = function (state, action) {
  console.warn('saveAnswer', state, state, currentAnswers, action);
  let currentAnswers = state.currentAnswers;
  console.warn('saveAnswer', currentAnswers);
  if (!currentAnswers) {
    currentAnswers = {};
  }
  updatedAnswers[action.question] = action.answer;
  return Object.assign({}, state, {
    // currentAnswers,
    // search: action.search ? action.search : '',
  });
};

export default function app(state = {}, action = {}) {
  const types = {
    [SAVE_ANSWER]: saveAnswer,
  };

  if (action.type in types) {
    return types[action.type](state, action);
  }

  return state;
}
