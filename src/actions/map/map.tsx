import { API } from 'aws-amplify';
import { Item } from '../../types/Item';
import { MarkerData } from '../../components/map/map';

// Actions
export const FETCH_MARKERS = 'FETCH_MARKERS';
export const FETCH_MARKERS_ERROR = 'FETCH_MARKERS_ERROR';

export const fetchMarkers = (id: number) => async dispatch => {
  try {
    const response: { items: Item[] } = await API.get('tba21', 'items/get', {});
    let responseMarkers: MarkerData[] = [];

    // TESTING popUp onclick button
    // createMapIcon('iconicon', {
    //   // https://pixabay.com/en/clipart-fish-sign-icon-cartoon-3418130/
    //   iconUrl: './assets/markers/fish.png',
    //   iconSize: [64, 43],
    //   iconAnchor: [32, 43],
    //   popupAnchor: [-3, -38]
    // });
    // data[5].icon = 'iconicon';
    // data[5].type = 'popUp';
    //
    // // TESTING popUp type icon
    // data[6].type = 'popUp';
    // createMapIcon('testing', {
    //   // https://pixabay.com/en/whale-blue-gray-fountain-spray-311849/
    //   iconUrl: './assets/markers/whale.svg',
    //   iconSize: [64, 43],
    //   iconAnchor: [32, 43],
    //   popupAnchor: [-3, -38]
    // });
    // data[6].icon = 'testing';
    // END TESTING

    if (response && response.items) {
      response.items.forEach((item: Item, index: number) => {
        const
          lng = item.location[0],
          lat = item.location[1];

        let markerData: MarkerData = {
          position: [lat, lng],
          data: item
        };

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
    dispatch({ type: FETCH_MARKERS_ERROR });
  }
};
