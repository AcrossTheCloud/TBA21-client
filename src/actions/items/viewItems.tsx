import { API } from 'aws-amplify';

export const FETCH_ITEMS = 'FETCH_ITEMS';

export const fetchItems = () => dispatch => {
    API.get('tba21', 'items/get', {})
      .then((data) => {
        if (data.Items) { data = data.Items; }

        dispatch({
          type: FETCH_ITEMS,
          items: data,
          sliderInitialized: true,
          sliderError: false,
        });
      })
      .catch((e: any) => { // tslint:disable-line: no-any
        dispatch({
          type: FETCH_ITEMS,
          items: [],
          sliderInitialized: true,
          sliderError: true,
        });
      });
};
