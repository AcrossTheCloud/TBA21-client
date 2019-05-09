import { FETCH_ITEM, FETCH_ITEM_ERROR } from '../../actions/items/viewItem';
import { OceanObject } from '../../components/pages/TableRow';

export interface State {
  hasError: boolean;
  itemId?: string | boolean;
  itemInformation?: OceanObject;
}

const initialState: State = {
  hasError: false
};

/**
 * Performs an action based on the action.type
 *
 * @param state {object} either empty or the previous state
 * @param action {string} the action to perform
 *
 * @returns {object} the state with modified values
 */
export default (state: State = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case FETCH_ITEM:
      return {
        ...state,
        itemInformation: action.itemInformation,
        itemId: action.itemId,
      };

    case FETCH_ITEM_ERROR:
      return {
        ...state,
        hasError: true,
      };

    default:
      return state;
  }

};
