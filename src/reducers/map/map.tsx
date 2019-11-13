import { MAP_FETCH_DATA, MAP_FETCH_DATA_ERROR } from '../../actions/map/map';

interface State {
  hasError: boolean;
}
const initialState: State = {
  hasError: false
};

export default (state: State | undefined = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case MAP_FETCH_DATA:
      return {
        ...state,
        data: action.data
      };
    case MAP_FETCH_DATA_ERROR:
      return {
        ...state,
        hasError: true
      };

    default:
      return state;
  }
};
