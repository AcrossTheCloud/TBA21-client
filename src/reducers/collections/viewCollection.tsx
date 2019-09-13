import { Alerts } from '../../components/utils/alerts';
import { Collection } from '../../types/Collection';
import { Item } from '../../types/Item';

// Defining our Actions for the reducers.
export const FETCH_COLLECTION = 'FETCH_COLLECTION';
export const FETCH_COLLECTION_ERROR = 'FETCH_COLLECTION_ERROR';
export const FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION = 'FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION';

export interface State extends Alerts {
  collectionId?: string | boolean;
  collection?: Collection;
  items?: Item[];
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
    case FETCH_COLLECTION:
      return {
        ...state,
        collection: action.collection,
        collectionId: action.collectionId,
        items: action.items,
        errorMessage: undefined
      };

    case FETCH_COLLECTION_ERROR:
      return {
        ...state,
        errorMessage: `Looks like we've had a bit of a hiccup.`,
      };

    case FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION:
      return {
        ...state,
        collection: action.collection,
        errorMessage: `Are you sure you've got the right url? We can't find what you're looking for. Sorry!`,
      };

    default:
      return state;
  }

};
