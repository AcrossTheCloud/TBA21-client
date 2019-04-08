import { API } from 'aws-amplify';

// Defining our Actions for the reducers.
export const FETCH_ITEM = 'FETCH_ITEM';
export const FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';

/**
 *
 * API call to fetch item information based on the itemID and dispatch it through to Redux
 *
 * @param itemId {string}
 */
export const fetchItem = (itemId: string) => (dispatch) => {
  if (!itemId) {
    dispatch({
     type: FETCH_ITEM,
     itemInformation: {},
   });
  }

  // API call to get the items information or return an error.
  API.get('tba21', 'items', {
    queryStringParameters : {
      itemId: itemId
    }
  })
  .then((data) => {
    dispatch({
     type: FETCH_ITEM,
     itemInformation: data,
     itemId: data.itemId,
    });
  })
  .catch((e: any) => { // tslint:disable-line: no-any
    dispatch({
       type: FETCH_ITEM_ERROR
     });
  });
};
