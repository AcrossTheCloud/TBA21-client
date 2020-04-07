import { Alerts } from '../../components/utils/alerts';
import { Collection } from '../../types/Collection';
import { Item } from '../../types/Item';

// Defining our Actions for the reducers.
export const FETCH_COLLECTION = 'FETCH_COLLECTION';
export const FETCH_COLLECTION_LOAD_MORE = 'FETCH_COLLECTION_LOAD_MORE';
export const FETCH_COLLECTION_NO_MORE_TO_LOAD = 'FETCH_COLLECTION_NO_MORE_TO_LOAD';
export const FETCH_COLLECTION_UPDATE_OFFSET = 'FETCH_COLLECTION_UPDATE_OFFSET';
export const FETCH_COLLECTION_ERROR = 'FETCH_COLLECTION_ERROR';
export const FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION = 'FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION';

export interface ViewCollectionState extends Alerts {
  collection?: Collection;
  offset?: number;
  data?: (Item & Collection)[];
  firstItem?: Item;
  noRedux?: boolean;
  noMoreData?: boolean;
}

const initialState: ViewCollectionState = {
  errorMessage: undefined,
  offset: 0,
  noRedux: false,
  firstItem: undefined
};

/**
 * Performs an action based on the action.type
 *
 * @param state {object} either empty or the previous state
 * @param action {object | string} the action to perform
 *
 * @returns {object} the state with modified values
 */
export default (state: ViewCollectionState = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case FETCH_COLLECTION:
      return {
        ...state,
        collection: action.collection,
        errorMessage: undefined,
        data: undefined,
        noRedux: false
      };
    case FETCH_COLLECTION_LOAD_MORE:
      const data = state.data ? [...state.data, ...action.datum] : [...action.datum];

      return {
        ...state,
        data,
        noRedux: false
      };

    case FETCH_COLLECTION_NO_MORE_TO_LOAD:
      return {
        ...state,
        noMoreData: true
      };

    case FETCH_COLLECTION_UPDATE_OFFSET:
      return {
        ...state,
        offset: action.offset
      };

    case FETCH_COLLECTION_ERROR:
      return {
        ...state,
        errorMessage: action.errorMessage ? action.errorMessage : `Looks like we've had a bit of a hiccup.`,
        noRedux: false
      };

    case FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION:
      return {
        ...state,
        collection: undefined,
        data: undefined,
        errorMessage: `Are you sure you've got the right url? We can't find what you're looking for. Sorry!`,
        noRedux: false
      };

    default:
      return state;
  }

};
