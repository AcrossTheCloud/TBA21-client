// import { API } from 'aws-amplify';

// Actions
export const MAP_FETCH_DATA = 'MAP_FETCH_DATA';
export const MAP_FETCH_DATA_ERROR = 'MAP_FETCH_DATA_ERROR';

export const fetchData = (
    latNE: number,
    latSW: number,
    lngNE: number,
    lngSW: number
) => async dispatch => {
  try {
    // const response = await API.get('tba21', 'items/get', {});
    dispatch({
       type: MAP_FETCH_DATA
     });
  } catch (e) {
    console.log('ERROR', e);
    dispatch({ type: MAP_FETCH_DATA_ERROR });
  }
};
