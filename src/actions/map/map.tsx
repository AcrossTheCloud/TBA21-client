import { API } from 'aws-amplify';
import { COLLECTION_MODAL_TOGGLE } from '../modals/collectionModal';
import { ITEM_MODAL_TOGGLE } from '../modals/itemModal';

export const MAP_FETCH_DATA = 'MAP_FETCH_DATA';
export const MAP_FETCH_DATA_ERROR = 'MAP_FETCH_DATA_ERROR';

// Modal
export const openModal = (id: string, type: 'item' | 'collection') => async dispatch => {

  if (type === 'collection') {
    // We have a collection.
    dispatch({
      type: COLLECTION_MODAL_TOGGLE,
      open: true,
      data: { id }
    });
  } else {
    dispatch({
      type: ITEM_MODAL_TOGGLE,
      open: true,
      data: { id }
    });
  }
};

export const fetchData = (coords: {
  lat_ne: number,
  lat_sw: number,
  lng_ne: number,
  lng_sw: number
}) => async dispatch => {
  try {
    const {
      lat_sw,
      lat_ne,

      lng_sw,
      lng_ne
    } = coords;

    const items = await API.get('tba21', 'map', {
      queryStringParameters: { lat_sw, lat_ne, lng_sw, lng_ne, type: 'item' }
    });

    if (items && items.data) {
      dispatch({ type: MAP_FETCH_DATA, data: items.data });
    }
    const collections = await API.get('tba21', 'map', {
      queryStringParameters: { lat_sw, lat_ne, lng_sw, lng_ne, type: 'collection' }
    });

    if (collections && collections.data) {
      dispatch({ type: MAP_FETCH_DATA, data: collections.data });
    }

  } catch (e) {
    console.log('ERROR', e);
    dispatch({ type: MAP_FETCH_DATA_ERROR });
  }
};
