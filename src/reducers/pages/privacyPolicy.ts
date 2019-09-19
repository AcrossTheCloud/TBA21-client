export const PP_MODAL = 'PP_MODAL';
export const TC_MODAL = 'TC_MODAL';

export interface PrivacyPolicyState {
  open?: boolean;
  tc_open?: boolean;
}
const initialState: PrivacyPolicyState = {
  open: false,
  tc_open: false,
};

export default (state: PrivacyPolicyState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    case PP_MODAL:
      return {
        open: action.open
      };
    case TC_MODAL:
      return {
        tc_open: action.tc_open
      };

    default:
      return state;
  }
};
