import { action, actions, state } from "../actions/search";

const initialState: state = {
  people: [],
};

export default (state = initialState, action: action) => {
  switch (action.type) {
    case actions.UPDATE:
      // action.payload
      return { ...state };
    default:
      return state;
  }
};
