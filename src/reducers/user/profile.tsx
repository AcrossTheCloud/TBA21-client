import { OVERLAY, DELETED_ACCOUNT, PROFILE_ERROR, PROFILE_SUCCESS } from '../../actions/user/profile';

interface State {
  errorMessage?: string | boolean;
  successMessage?: string | boolean;
  accountDeleted: boolean;
  deletingAccount: boolean;
}
const initialState: State = {
  accountDeleted: false,
  deletingAccount: false,
};

export default (state: State|null = initialState, action) => {
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

    default:
      return state;
  }
};
