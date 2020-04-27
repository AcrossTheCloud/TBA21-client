// Defining our Actions for the reducers.
import { PP_MODAL } from '../../reducers/pages/privacyPolicy';

export const modalToggle = (type: 'PP_MODAL' | 'TC_MODAL' | 'RL_MODAL' = PP_MODAL, open: boolean = false) => dispatch => {
  const state = {
    type
  };

  if (type === 'TC_MODAL') {
    Object.assign(state, { tc_open: open });
  } else if (type === 'RL_MODAL') {
    Object.assign(state, {rl_open: open});
  } else {
    Object.assign(state, { open });
  }

  dispatch(state);
};
