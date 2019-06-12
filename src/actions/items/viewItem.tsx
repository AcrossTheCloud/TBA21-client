import { API } from 'aws-amplify';

// Defining our Actions for the reducers.
export const FETCH_ITEM = 'FETCH_ITEM';
export const FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';
export const FETCH_ITEM_ERROR_NO_SUCH_ITEM = 'FETCH_ITEM_ERROR_NO_SUCH_ITEM';

/**
 *
 * API call to fetch item information based on the itemID and dispatch it through to Redux
 *
 * @param itemId {string}
 */
export const fetchItem = (itemId) => async (dispatch, getState) => {

  const prevState = getState();

  // Detect if we have the same itemID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (itemId === prevState.viewItem.itemId) {
    return prevState.viewItem;
  }

  if (!itemId) {
    dispatch({
     type: FETCH_ITEM,
     item: {},
   });
  }

  try {
    const response = await API.get('tba21', 'items/getById', {
      queryStringParameters : {
        id: itemId
      }
    });

    if (response.items.length) {
      const item = response.items[0];
      dispatch({
       type: FETCH_ITEM,
       item: item,
       itemId: response.id,
     });
    } else {
      dispatch({
         type: FETCH_ITEM_ERROR_NO_SUCH_ITEM,
         item: {}
      });
    }
  } catch (e) {
      dispatch({
        type: FETCH_ITEM_ERROR
      });
  }
};
