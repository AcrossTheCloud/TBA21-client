import { API } from 'aws-amplify';
import { COLLECTION_MODAL_TOGGLE } from '../modals/collectionModal';
import { ITEM_MODAL_TOGGLE } from '../modals/itemModal';

export const MAP_FETCH_DATA = 'MAP_FETCH_DATA';
export const MAP_FETCH_DATA_ERROR = 'MAP_FETCH_DATA_ERROR';

// Modal
export const openModal = (id: string, metaType: 'item' | 'collection') => async dispatch => {
  const type = metaType === 'collection' ? COLLECTION_MODAL_TOGGLE : ITEM_MODAL_TOGGLE;

  dispatch({
     type,
     open: true,
     data: { id }
   });
};

export const fetchData = (coords: {
  lat_ne: number,
  lat_sw: number,
  lng_ne: number,
  lng_sw: number
}, itemids: number[], collectionids: number[]) => async dispatch => {
  try {
    const {
      lat_sw,
      lat_ne,

      lng_sw,
      lng_ne
    } = coords;

    const items = await API.post('tba21', 'map', {
      body: { lat_sw, lat_ne, lng_sw, lng_ne, type: 'item', itemids: itemids ? itemids : [] }
    });

    if (items && items.data) {
      dispatch({ type: MAP_FETCH_DATA, data: items.data });
    }
    const collections = await API.post('tba21', 'map', {
      body: { lat_sw, lat_ne, lng_sw, lng_ne, type: 'collection', collectionids: collectionids ? collectionids : [] }
    });

    if (collections && collections.data) {
      dispatch({ type: MAP_FETCH_DATA, data: collections.data });
    }

  } catch (e) {
    console.log('ERROR', e);
    dispatch({ type: MAP_FETCH_DATA_ERROR });
  }
};
