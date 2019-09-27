export const ABOUT_MODAL = 'ABOUT_MODAL';

export interface AboutState {
  open?: boolean;
}
const initialState: AboutState = {
  open: false
};

export default (state: AboutState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    case ABOUT_MODAL:
      return {
        open: action.open
      };

    default:
      return state;
  }
};
