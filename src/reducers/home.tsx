import { LOGO_STATE } from 'actions/home';

interface State {
  logoLoaded: boolean;
}
const initialState: State = {
  logoLoaded: false
};

export default (state: State | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case LOGO_STATE:
      return {
        ...state,
        logoLoaded: action.logoLoaded
      };

    default:
      return state;
  }
};
