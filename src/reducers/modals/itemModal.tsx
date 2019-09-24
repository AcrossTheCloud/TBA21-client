import { ITEM_MODAL_TOGGLE } from '../../actions/modals/itemModal';
import { Item } from '../../types/Item';

interface State {
  open: boolean;
  data?: Item;
}

const initialState = {
  open: false
};

export default (state: State | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case ITEM_MODAL_TOGGLE:
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
