import {
  OVERLAY,
  DELETED_ACCOUNT,
  PROFILE_ERROR,
  PROFILE_SUCCESS,
  PROFILE_GET_DETAILS,
  PROFILE_ADD_FAVORITE_LOADING,
  PROFILE_DELETE_FAVORITE_LOADING,
} from "../../actions/user/profile";
import { Profile } from "../../types/Profile";
import { Alerts } from "../../components/utils/alerts";
import { PROFILE_DELETE_FAVORITE_ERROR } from "../../actions/user/profile";

export interface ProfileState extends Alerts {
  accountDeleted: boolean;
  deletingAccount: boolean;
  overlay: boolean;
  details: Profile | undefined;
  favouriteIsLoading: boolean;
}
const initialState: ProfileState = {
  accountDeleted: false,
  deletingAccount: false,
  overlay: false,
  details: undefined,
  favouriteIsLoading: false,
};

export default (state: ProfileState | null = initialState, action) => {
  if (state === undefined) {
    state = initialState;
  }

  switch (action.type) {
    case DELETED_ACCOUNT:
      return {
        ...state,
        accountDeleted: true,
      };
    case OVERLAY:
      let overlayState = {
        ...initialState,
        overlay: action.overlay,
      };
      // If there's an error message, pass it through.
      if (typeof action.message !== "undefined") {
        Object.assign(overlayState, { errorMessage: action.message });
      }
      return {
        ...initialState,
        overlay: action.overlay,
        favouriteIsLoading: true,
      };
    case PROFILE_ERROR:
      let profileErrorState = {
        ...initialState,
      };

      // If there's an error message, pass it through.
      if (typeof action.message !== "undefined") {
        Object.assign(profileErrorState, { errorMessage: action.message });
      }

      return profileErrorState;
    case PROFILE_SUCCESS:
      let profileSuccessState = {
        ...initialState,
      };

      // If there's an error message, pass it through.
      if (typeof action.message !== "undefined") {
        Object.assign(profileSuccessState, { successMessage: action.message });
      }

      return profileSuccessState;

    case PROFILE_GET_DETAILS:
      return {
        ...initialState,
        details: action.details,
        overlay: false,
        favouriteIsLoading: false,
      };

    case PROFILE_ADD_FAVORITE_LOADING:
    case PROFILE_DELETE_FAVORITE_LOADING:
      return {
        ...state,
        favouriteIsLoading: true,
      };

    // we invalidate loading state based on PROFILE_GET_DETAILS status
    // case PROFILE_ADD_FAVORITE_SUCCESS:
    // case PROFILE_DELETE_FAVORITE_SUCCESS:
    case PROFILE_DELETE_FAVORITE_ERROR:
      return {
        ...state,
        favouriteIsLoading: false,
      };

    default:
      return state;
  }
};
