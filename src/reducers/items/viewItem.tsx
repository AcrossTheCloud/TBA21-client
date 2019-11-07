import { FETCH_ITEM, FETCH_ITEM_ERROR, FETCH_ITEM_ERROR_NO_SUCH_ITEM } from '../../actions/items/viewItem';
import { Item } from '../../types/Item';
import { Alerts } from '../../components/utils/alerts';

export interface State extends Alerts {
  itemId?: string | boolean;
  item?: Item;
}

const initialState: State = {
  errorMessage: undefined
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
        item: action.item,
        itemId: action.itemId,
        errorMessage: undefined
      };

    case FETCH_ITEM_ERROR:
      return {
        ...state,
        errorMessage: `Looks like we've had a bit of a hiccup.`,
      };

    case FETCH_ITEM_ERROR_NO_SUCH_ITEM:
      return {
        ...state,
        errorMessage: `Are you sure you've got the right url? We can't find what you're looking for. Sorry!`,
      };

    default:
      return state;
  }

};
