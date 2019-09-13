import { API } from 'aws-amplify';
import {
  FETCH_PROFILE,
  FETCH_PROFILE_ERROR,
  FETCH_PROFILE_ERROR_NO_SUCH_PROFILE
} from '../../reducers/user/viewProfile';
/**
 *
 * API call to fetch profile information based on the profileID and dispatch it through to Redux
 *
 * @param profileId {string}
 */
export const fetchProfile = (profileId: string) => async (dispatch, getState) => {
  const prevState = getState();

  // Detect if we have the same profileID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewItem.profile && profileId === prevState.viewItem.profile.profileId) {
    return prevState.viewItem;
  } else {

    try {
      const response = await API.get('tba21', 'profiles', {
        queryStringParameters: {
          id: profileId
        }
      });

      if (!!response.profile && response.profile.length && response.profile[0]) {
        const profile = response.profile[0];

        dispatch({
                   type: FETCH_PROFILE,
                   profile: profile
                 });
      } else {
        dispatch({
                   type: FETCH_PROFILE_ERROR_NO_SUCH_PROFILE,
                   profile: {}
                 });
      }
    } catch (e) {
      dispatch({
                 type: FETCH_PROFILE_ERROR
               });
    }
  }
};
