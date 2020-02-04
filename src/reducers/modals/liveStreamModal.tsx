import { LIVESTREAM_MODAL_TOGGLE } from '../../actions/modals/liveStreamModal';

interface State {
  open: boolean;
  hasOpened: boolean;
  stream: string;
}

const initialState = {
  open: false,
  hasOpened: false,
  stream: ''
};

export default (state: State | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case LIVESTREAM_MODAL_TOGGLE:
      console.log('dsfdsf', action.hasOpened);
      const newState = {
        ...state,
        hasOpened: action.hasOpened,
        open: action.open,
        stream: action.stream
      };

      return newState;
    default:
      return state;
  }
};
