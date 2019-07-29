// Defining our Actions for the reducers
export const LOGO_STATE = 'LOGO_STATE';

export const logoDispatch = (state: boolean) => async dispatch => {
  dispatch(
    {
      type: LOGO_STATE,
      logoLoaded: state
    }
  );
};
