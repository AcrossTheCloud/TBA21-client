// Defining our Actions for the reducers.
import { ABOUT_MODAL } from 'reducers/pages/about';

export const modalToggle = (open: boolean = false) => dispatch => {
  dispatch({ type: ABOUT_MODAL, open });
};
