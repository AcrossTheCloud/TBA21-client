export const PP_MODAL = 'PP_MODAL';
export const TC_MODAL = 'TC_MODAL';
export const RL_MODAL = 'RL_MODAL';

export interface PrivacyPolicyState {
  open?: boolean;
  tc_open?: boolean;
  rl_open?: boolean;
}
const initialState: PrivacyPolicyState = {
  open: false,
  tc_open: false,
  rl_open: false
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
    case RL_MODAL:
      return {
        rl_open: action.rl_open
      };

    default:
      return state;
  }
};
