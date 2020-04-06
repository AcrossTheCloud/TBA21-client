import { Item } from '../../types/Item';
import { checkFile } from '../items/viewItem';
import { LOADINGOVERLAY } from '../loadingOverlay';
import { FETCH_COLLECTION_LOAD_MORE } from '../../reducers/collections/viewCollection';
import { getCollectionByUuid, getItemsInCollection } from '../../REST/collections';
import { removeTopology } from '../../components/utils/removeTopology';
import { Collection } from '../../types/Collection';

// Defining our Actions for the reducers.
export const FETCH_COLLECTION = 'FETCH_COLLECTION';
export const FETCH_COLLECTION_ERROR = 'FETCH_COLLECTION_ERROR';
export const FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION = 'FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION';

/**
 *
 * API call to fetch collection information based on the collectionID and dispatch it through to Redux
 *
 * @param uuid {string}
 */
export const fetchCollection = (uuid: string) => async (dispatch, getState) => {
  const prevState = getState();

  dispatch({
     type: LOADINGOVERLAY,
     on: true
   });

  // Detect if we have the same collectionID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewCollection.collection && uuid === prevState.viewCollection.collection.uuid) {
    dispatch({
       type: LOADINGOVERLAY,
       on: false
     });
    return prevState.viewCollection;

  } else {

    try {
      const response = await getCollectionByUuid(uuid);
      const collection = await removeTopology(response) as Collection[];

      if (!!collection && !!collection[0] && Object.keys(collection).length) {
        let i;
        for (i = 0; i < collection.length; i++) {
            const id = collection[i].id;
            const itemResponse = await getItemsInCollection({ id, limit: 1000 });
            dispatch({
                       type: FETCH_COLLECTION,
                       collection: collection[i],
                       offset: 0,
                       ...await loadMore(removeTopology(itemResponse) as Item[])
                   });
        }
      } else {
        dispatch({
         type: FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION,
         collection: undefined,
         items: {}
       });
      }
    } catch (e) {
      console.log(e.message);
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

export const loadMore = async (items: Item[], offset: number = -1, forward: boolean = true, dispatch?: Function) => {
  if (items && items.length && offset < items.length) {
    for (let i = 0; i < 8; i++) {
      if (forward) {
        offset++;
      } else {
        offset--;
      }

      if (offset < 0) {
        offset = items.length - 1;
      } else if (offset >= items.length) {
        offset = 0;
      }

      // Get the items file
      if (items[offset] && !items[offset].file) {
        if (typeof dispatch === 'function') {
          dispatch({ type: LOADINGOVERLAY, on: true }); // Turn on the loading overlay
        }
        const file = await checkFile(items[offset]);
        if (file) {
          Object.assign(items[offset], {file});
        }
      }
    }
  }

  if (typeof dispatch === 'function') {
    dispatch({ type: LOADINGOVERLAY, on: false }); // Turn on the loading overlay
  }

  return {
     items: [...items],
     offset: offset
   };
};

export const loadMoreDispatch = (forward: boolean = true) => async (dispatch, getState) => {
  const state = getState();
  dispatch({
   type: FETCH_COLLECTION_LOAD_MORE,
   ...await loadMore(state.viewCollection.items, state.viewCollection.offset, forward, dispatch)
 });
};
