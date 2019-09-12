import { Alerts } from '../../components/utils/alerts';
import { Profile } from '../../types/Profile';

// Defining our Actions for the reducers.
export const FETCH_PROFILE = 'FETCH_PROFILE';
export const FETCH_PROFILE_ERROR = 'FETCH_PROFILE_ERROR';
export const FETCH_PROFILE_ERROR_NO_SUCH_PROFILE = 'FETCH_PROFILE_ERROR_NO_SUCH_PROFILE';

export interface State extends Alerts {
  profileId?: string | boolean;
  profile?: Profile;
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

    default:
      return state;
  }

};
