import { API } from 'aws-amplify';
import { Item } from '../../types/Item';
import { MarkerData } from '../../components/map/map';

// Actions
export const FETCH_MARKERS = 'FETCH_MARKERS';
export const FETCH_MARKERS_ERROR = 'FETCH_MARKERS_ERROR';

export const fetchMarkers = (
    latNE: number,
    latSW: number,
    lngNE: number,
    lngSW: number
) => async dispatch => {
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

        if (item.location) {
          const geoJSON: { type: string, coordinates: [number, number]} = JSON.parse(item.location);
          if (geoJSON.coordinates) {
            markerData.position = [geoJSON.coordinates[0], geoJSON.coordinates[1]];
          }
        }

        if (item.map_icon && item.map_icon.length > 0) {
          markerData.icon = item.map_icon;
        }

        Object.assign(responseMarkers, { [item.s3_key]: markerData });
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
