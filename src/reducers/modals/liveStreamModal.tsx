import { LIVESTREAM_MODAL_TOGGLE } from '../../actions/modals/liveStreamModal';

interface State {
  open: boolean;
}

const initialState = {
  open: false
};

export default (state: State | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case LIVESTREAM_MODAL_TOGGLE:
      const newState = {
        ...state,
        open: action.open
      };

      return newState;
    default:
      return state;
  }
};
