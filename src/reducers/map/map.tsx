import { FETCH_MARKERS, FETCH_MARKERS_ERROR, PUT_MODIFIED_MARKERS } from '../../actions/map/map';
import { MarkerData } from 'src/components/map/map';

interface State {
  markers: MarkerData[];
  modifiedMarkers: MarkerData[];
  hasError: boolean;
}
const initialState: State = {
  markers: [],
  modifiedMarkers: [],
  hasError: false
};

export default (state: State|null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case FETCH_MARKERS:
      return {
        ...state,
        markers: action.markerData,
        modifiedMarkers: [],
      };
    case FETCH_MARKERS_ERROR:
      return {
        ...state,
        hasError: true,
        markers: [],
        modifiedMarkers: [],
      };

    case PUT_MODIFIED_MARKERS:
      return {
        ...state,
        modifiedMarkers: action.markers,
      };

    default:
      return state;
  }
};
