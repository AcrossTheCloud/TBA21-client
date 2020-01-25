// Defining our Actions for the reducers
export const LIVESTREAM_MODAL_TOGGLE = 'LIVESTREAM_MODAL_TOGGLE';

// Modal
export const toggle = (open: boolean, ) => dispatch => {
  dispatch({
     type: LIVESTREAM_MODAL_TOGGLE,
     open
   });
};
