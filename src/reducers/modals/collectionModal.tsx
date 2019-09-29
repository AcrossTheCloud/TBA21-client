import { COLLECTION_MODAL_TOGGLE } from '../../actions/modals/collectionModal';
import { Collection } from '../../types/Collection';

interface State {
  open: boolean;
  data?: Collection;
}

const initialState = {
  open: false
};

export default (state: State | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case COLLECTION_MODAL_TOGGLE:
      const newState = {
        ...state,
        open: action.open,
        data: undefined
      };

      if (action.data) {
        Object.assign(newState, { data: action.data });
      }

      return newState;
    default:
      return state;
  }
};
