import { API } from 'aws-amplify';

// Actions
export const FETCH_MARKERS = 'FETCH_MARKERS';
export const FETCH_MARKERS_ERROR = 'FETCH_MARKERS_ERROR';
export const PUT_MODIFIED_MARKERS = 'PUT_MODIFIED_MARKERS';

export const fetchMarkers = () => dispatch => {
  const dispatchError = (): void => {
    dispatch({
       type: FETCH_MARKERS_ERROR
     });
  };

  API.get('tba21', 'items', {})
    .then((data) => {
      if ( !data || (data && !data.Items) ) {
        return dispatchError();
      }
      dispatch({
       type: FETCH_MARKERS,
       markerData: data.Items,
     });
    })
    .catch((e: any) => { // tslint:disable-line: no-any
      dispatchError();
    });
};

export const putModifiedMarkers = (markers) => dispatch => {
  if (!markers.length) {
    dispatch({
     type: FETCH_MARKERS_ERROR
   });
  }

  dispatch({
     type: PUT_MODIFIED_MARKERS,
     markers: markers,
   });

};
