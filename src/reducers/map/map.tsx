import { FETCH_MARKERS, FETCH_MARKERS_ERROR } from '../../actions/map/map';
import { MarkerData } from 'components/map/map';

interface State {
  markers: {
    [id: string]: MarkerData
  };
  hasError: boolean;
}
const initialState: State = {
  markers: {},
  hasError: false
};

export default (state: State | undefined = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case FETCH_MARKERS:
      return {
        ...state,
        markers: {...state.markers, ...action.markers}
      };
    case FETCH_MARKERS_ERROR:
      return {
        ...state,
        hasError: true,
        markers: {}
      };

    default:
      return state;
  }
};
