import { API } from 'aws-amplify';
import { Item } from '../../types/Item';
import { checkFile } from '../items/viewItem';
import { LOADINGOVERLAY } from '../loadingOverlay';

// Defining our Actions for the reducers.
export const FETCH_COLLECTION = 'FETCH_COLLECTION';
export const FETCH_COLLECTION_ERROR = 'FETCH_COLLECTION_ERROR';
export const FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION = 'FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION';

/**
 *
 * API call to fetch collection information based on the collectionID and dispatch it through to Redux
 *
 * @param id {string}
 */
export const fetchCollection = (id: string) => async (dispatch, getState) => {
  const prevState = getState();

  dispatch({
     type: LOADINGOVERLAY,
     on: true
   });

  // Detect if we have the same collectionID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewCollection.collection && id === prevState.viewCollection.collection.id) {
    return prevState.viewCollection;
  } else {

    try {
      const response = await API.get('tba21', 'collections/getById', {
        queryStringParameters: {
          id: id
        }
      });

      if (!!response.collection && Object.keys(response.collection).length) {
        const collection = response.collection;
        const items: Item[] = [];

        const itemResponse = await API.get('tba21', 'collections/getItemsInCollection', {
          queryStringParameters: {
            id: collection.id
          }
        });

        if (itemResponse.items && itemResponse.items.length) {
          for (let i = 0; i < itemResponse.items.length; i++) {
            const item = itemResponse.items[i];
            // Get the items file
            const file = await checkFile(item);
            if (file) {
              items.push({ ...item, file });
            }
          }
        }

        dispatch({
           type: FETCH_COLLECTION,
           collection: collection,
           items: items
         });

      } else {
        dispatch({
         type: FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION,
         collection: {},
         items: {}
       });
      }
    } catch (e) {
      dispatch({
         type: FETCH_COLLECTION_ERROR
       });
    } finally {
      dispatch({
       type: LOADINGOVERLAY,
       on: false
     });
    }
  }
};
