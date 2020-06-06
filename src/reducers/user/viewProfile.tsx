import { Alerts } from '../../components/utils/alerts';
import { Profile } from '../../types/Profile';
import { Item } from 'types/Item';
// import { removeTopology } from '../../components/utils/removeTopology';
import { Collection } from 'types/Collection';

// Defining our Actions for the reducers.
export const FETCH_PROFILE = 'FETCH_PROFILE';
export const FETCH_PROFILE_ERROR = 'FETCH_PROFILE_ERROR';
export const FETCH_PROFILE_ERROR_NO_SUCH_PROFILE = 'FETCH_PROFILE_ERROR_NO_SUCH_PROFILE';

export const FETCH_PROFILE_ITEMS_LOADING = 'PFETCH_PROFILE_ITEMS_LOADING'
export const FETCH_PROFILE_ITEMS_SUCCEED = 'FETCH_PROFILE_ITEMS_SUCCEED'
export const FETCH_PROFILE_ITEMS_ERROR = 'FETCH_PROFILE_ITEMS_ERROR'

export const FETCH_PROFILE_COLLECTIONS_LOADING = 'PFETCH_PROFILE_COLLECTIONS_LOADING'
export const FETCH_PROFILE_COLLECTIONS_SUCCEED = 'FETCH_PROFILE_COLLECTIONS_SUCCEED'
export const FETCH_PROFILE_COLLECTIONS_ERROR = 'FETCH_PROFILE_COLLECTIONS_ERROR'

export interface State extends Alerts {
  profileId?: string | boolean;
  profile?: Profile;
  items: Item[];
  collections: Collection[];
  isItemsLoading: boolean;
  isCollectionsLoading: boolean;
}

const initialState: State = {
  errorMessage: undefined,
  items: [],
  collections: [],
  isItemsLoading: false,
  isCollectionsLoading: false,
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
        ...state,
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

    case FETCH_PROFILE_ITEMS_LOADING:
      return {
        ...state,
        isItemsLoading: true,
      }
    case FETCH_PROFILE_ITEMS_SUCCEED:
      return {
        ...state,
        isItemsLoading: false,
        items: action.data
      }
    case FETCH_PROFILE_ITEMS_ERROR:
      return {
        ...state,
        isItemsLoading: false,
        items: [],
        errorMessage: "Some error is occurred. Please try again later."
      }

      case FETCH_PROFILE_COLLECTIONS_LOADING:
        return {
          ...state,
          isCollectionsLoading: true,
        }
      case FETCH_PROFILE_COLLECTIONS_SUCCEED:
        return {
          ...state,
          isCollectionsLoading: false,
          collections: action.data
        }
      case FETCH_PROFILE_COLLECTIONS_ERROR:
        return {
          ...state,
          isItemsLoading: false,
          collections: [],
          errorMessage: "Some error is occurred. Please try again later."
        }

    default:
      return state;
  }

};
