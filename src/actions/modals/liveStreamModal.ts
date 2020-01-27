// Defining our Actions for the reducers
export const LIVESTREAM_MODAL_TOGGLE = 'LIVESTREAM_MODAL_TOGGLE';

// Modal
export const toggle = (open: boolean, stream: string) => dispatch => {
  dispatch({
     type: LIVESTREAM_MODAL_TOGGLE,
     open,
     stream: stream
   });
};
