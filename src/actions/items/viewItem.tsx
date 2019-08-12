import { API } from 'aws-amplify';

// Defining our Actions for the reducers.
export const FETCH_ITEM = 'FETCH_ITEM';
export const FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';
export const FETCH_ITEM_ERROR_NO_SUCH_ITEM = 'FETCH_ITEM_ERROR_NO_SUCH_ITEM';

/**
 *
 * API call to fetch item information based on the itemID and dispatch it through to Redux
 *
 * @param s3key {string}
 */
export const fetchItem = (s3key: string) => async (dispatch, getState) => {
  const prevState = getState();

  // Detect if we have the same itemID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewItem.item && s3key === prevState.viewItem.item.s3_key) {
    return prevState.viewItem;
  }

  if (!s3key) {
    dispatch({
     type: FETCH_ITEM,
     item: {},
   });
  }

  try {
    const response = await API.get('tba21', 'items/getItem', {
      queryStringParameters : {
        s3Key: s3key
      }
    });

    if (!!response.item && Object.keys(response.item).length) {
      const item = response.item;
      dispatch({
       type: FETCH_ITEM,
       item: item
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
