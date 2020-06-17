import { Alerts } from '../../components/utils/alerts';
import { Profile } from '../../types/Profile';
import { Item } from 'types/Item';
import { Collection } from 'types/Collection';

// Defining our Actions for the reducers.
export const FETCH_PROFILE = 'FETCH_PROFILE';
export const FETCH_PROFILE_ERROR = 'FETCH_PROFILE_ERROR';
export const FETCH_PROFILE_ERROR_NO_SUCH_PROFILE = 'FETCH_PROFILE_ERROR_NO_SUCH_PROFILE';

export const FETCH_PROFILE_ITEMS_AND_COLLECTIONS_LOADING = 'FETCH_PROFILE_ITEMS_AND_COLLECTIONS_LOADING'
export const FETCH_PROFILE_ITEMS_AND_COLLECTIONS_SUCCEED = 'FETCH_PROFILE_ITEMS_AND_COLLECTIONS_SUCCEED'
export const FETCH_PROFILE_ITEMS_AND_COLLECTIONS_ERROR = 'FETCH_PROFILE_ITEMS_AND_COLLECTIONS_ERROR'

export const profileItemAndCollectionsFetchLimit = 15

export interface State extends Alerts {
  profileId?: string | boolean;
  profile?: Profile;
  items: Item[];
  collections: Collection[];
  itemsHasMore: boolean,
  collectionsHasMore: boolean,
  isItemsAndCollectionsLoading: boolean;
}

const initialState: State = {
  errorMessage: undefined,
  items: [],
  collections: [],
  isItemsAndCollectionsLoading: false,
  itemsHasMore: true,
  collectionsHasMore: true
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
    case FETCH_PROFILE:
      return {
        ...initialState,
        profile: action.profile,
        profileId: action.profileId,
        errorMessage: undefined
      };

    case FETCH_PROFILE_ERROR:
      return {
        ...state,
        errorMessage: `Looks like we've had a bit of a hiccup.`,
      };

    case FETCH_PROFILE_ERROR_NO_SUCH_PROFILE:
      return {
        ...state,
        profile: action.profile,
        errorMessage: `Are you sure you've got the right url? We can't find what you're looking for. Sorry!`,
      };

    case FETCH_PROFILE_ITEMS_AND_COLLECTIONS_LOADING:
      return {
        ...state,
        isItemsAndCollectionsLoading: true,
      }
    case FETCH_PROFILE_ITEMS_AND_COLLECTIONS_SUCCEED:
      return {
        ...state,
        isItemsAndCollectionsLoading: false,
        items: [
          ...state.items,
          ...action.items
        ],
        collections: [
          ...state.collections,
          ...action.collections
        ],
        itemsHasMore: action.items.length >= profileItemAndCollectionsFetchLimit,
        collectionsHasMore: action.collections.length >= profileItemAndCollectionsFetchLimit,
      }
    case FETCH_PROFILE_ITEMS_AND_COLLECTIONS_ERROR:
      return {
        ...state,
        isItemsAndCollectionsLoading: false,
        itemsHasMore: false,
        collectionsHasMore: false,
        errorMessage: "Some error is occurred. Please try again later."
      }

    default:
      return state;
  }

};
