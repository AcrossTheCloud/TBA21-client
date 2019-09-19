import { LOADINGOVERLAY } from '../actions/loadingOverlay';

export interface LoadingOverlayState {
  on?: boolean;
}
const initialState: LoadingOverlayState = {
  on: undefined,
};

export default (state: LoadingOverlayState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case LOADINGOVERLAY:
      return {
        on: action.on
      };
    default:
      return state;
  }
};
