import { API } from 'aws-amplify';
import { Item } from '../../types/Item';
import { MarkerData } from '../../components/map/map';

// Actions
export const FETCH_MARKERS = 'FETCH_MARKERS';
export const FETCH_MARKERS_ERROR = 'FETCH_MARKERS_ERROR';

export const fetchMarkers = (id: number) => async dispatch => {
  try {
    const response = await API.get('tba21', 'items/get', {});

    let responseMarkers: { [id: string]: MarkerData } = {};
    if (response && response.items) {
      response.items.forEach((item: Item) => {
        let
          markerData: MarkerData = {
            position: [0, 0],
            data: item
          };

        if (item.geojson) {
          const geoJSON: { type: string, coordinates: [number, number]} = JSON.parse(item.geojson);
          if (geoJSON.coordinates) {
            markerData.position = [geoJSON.coordinates[0], geoJSON.coordinates[1]];
          }
        }

        if (item.icon && item.icon.length > 0) {
          markerData.icon = item.icon;
        }

        Object.assign(responseMarkers, { [item.id]: markerData });
      });
    }

    dispatch({
       type: FETCH_MARKERS,
       markers: responseMarkers,
     });
  } catch (e) {
    console.log('ERROR', e);
    dispatch({ type: FETCH_MARKERS_ERROR });
  }
};
