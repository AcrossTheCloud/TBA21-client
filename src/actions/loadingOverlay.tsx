// Defining our Actions for the reducers.

export const LOADINGOVERLAY = 'LOADINGOVERLAY';

export const toggleOverlay = (on: boolean) => dispatch => {
  dispatch({
     type: LOADINGOVERLAY,
     on
   });
};
