import { API } from 'aws-amplify';
import { Item } from '../../types/Item';
import { checkFile } from '../items/viewItem';
import { LOADINGOVERLAY } from '../loadingOverlay';
import { FETCH_COLLECTION_LOAD_MORE } from '../../reducers/collections/viewCollection';

// Defining our Actions for the reducers.
export const FETCH_COLLECTION = 'FETCH_COLLECTION';
export const FETCH_COLLECTIONS = 'FETCH_COLLECTIONS';
export const FETCH_COLLECTION_ERROR = 'FETCH_COLLECTION_ERROR';
export const FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION =
  'FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION';

/**
 *
 * API call to fetch collection information based on the collectionID and dispatch it through to Redux
 *
 * @param id {string}
 */

export const fetchProfileCollections = (uuid: string) => async (
  dispatch,
  getState
) => {
  // const prevState = getState();

  dispatch({
    type: LOADINGOVERLAY,
    on: true
  });

  try {
    // TODO: this returns an array of collections
    const { collections } = await API.get('tba21', 'collections', {
      queryStringParameters: {
        uuid: '7e32b7c6-c6d3-4e70-a101-12af2df21a19'
      }
    });
    if (!!collections && collections.length) {
      Promise.all(
        collections.map(async collection => {
          console.log(collection.id);
          const itemResponse = await API.get(
            'tba21',
            'collections/getItemsInCollection',
            {
              queryStringParameters: {
                id: collection.id,
                limit: 1000
              }
            }
          );

          return await loadMore(itemResponse.items);
        })
      ).then((collectionBundles: any[]) => {
        const items = collectionBundles.flatMap(collection => collection.items);
        console.log(collectionBundles, items);
        dispatch({
          type: FETCH_COLLECTION,
          collection: collections,
          offset: 0,
          items
        });
      });
    }
  } catch {
  } finally {
    dispatch({
      type: LOADINGOVERLAY,
      on: false
    });
  }
};

export const fetchCollection = (id: string) => async (dispatch, getState) => {
  const prevState = getState();

  dispatch({
    type: LOADINGOVERLAY,
    on: true
  });

  // Detect if we have the same collectionID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (
    prevState.viewCollection.collection &&
    id === prevState.viewCollection.collection.id
  ) {
    dispatch({
      type: LOADINGOVERLAY,
      on: false
    });
    return prevState.viewCollection;
  } else {
    try {
      const response = await API.get('tba21', 'collections/getById', {
        queryStringParameters: {
          id
        }
      });

      if (!!response.collection && Object.keys(response.collection).length) {
        const itemResponse = await API.get(
          'tba21',
          'collections/getItemsInCollection',
          {
            queryStringParameters: {
              id,
              limit: 1000
            }
          }
        );

        dispatch({
          type: FETCH_COLLECTION,
          collection: response.collection,
          offset: 0,
          ...(await loadMore(itemResponse.items))
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

export const loadMore = async (
  items: Item[],
  offset: number = -1,
  forward: boolean = true,
  dispatch?: Function
) => {
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
          Object.assign(items[offset], { file });
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

export const loadMoreDispatch = (forward: boolean = true) => async (
  dispatch,
  getState
) => {
  const state = getState();
  dispatch({
    type: FETCH_COLLECTION_LOAD_MORE,
    ...(await loadMore(
      state.viewCollection.items,
      state.viewCollection.offset,
      forward,
      dispatch
    ))
  });
};
