import { OVERLAY, DELETED_ACCOUNT, PROFILE_ERROR, PROFILE_SUCCESS, PROFILE_GET_DETAILS } from '../../actions/user/profile';
import { Profile } from '../../types/Profile';
import { Alerts } from '../../components/utils/alerts';

export interface ProfileState extends Alerts {
  accountDeleted: boolean;
  deletingAccount: boolean;
  overlay: boolean;
  details: Profile | undefined;
}
const initialState: ProfileState = {
  accountDeleted: false,
  deletingAccount: false,
  overlay: false,
  details: undefined
};

export default (state: ProfileState|null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case DELETED_ACCOUNT:
      return {
        ...state,
        accountDeleted: true
      };
    case OVERLAY:
      let overlayState = {
        ...initialState,
        overlay: action.overlay
      };
      // If there's an error message, pass it through.
      if (typeof action.message !== 'undefined') {
        Object.assign(overlayState, {errorMessage: action.message});
      }
      return {
        ...initialState,
        overlay: action.overlay
      };
    case PROFILE_ERROR:
      let profileErrorState = {
        ...initialState,
      };

      // If there's an error message, pass it through.
      if (typeof action.message !== 'undefined') {
        Object.assign(profileErrorState, {errorMessage: action.message});
      }

      return profileErrorState;
    case PROFILE_SUCCESS:
      let profileSuccessState = {
        ...initialState,
      };

      // If there's an error message, pass it through.
      if (typeof action.message !== 'undefined') {
        Object.assign(profileSuccessState, {successMessage: action.message});
      }

      return profileSuccessState;

    case PROFILE_GET_DETAILS:
      return {
        ...initialState,
        details: action.details,
        overlay: false
      };

    default:
      return state;
  }
};
