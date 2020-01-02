import { Item } from '../../types/Item';
import { checkFile } from '../items/viewItem';
import { LOADINGOVERLAY } from '../loadingOverlay';
import { getById, getCollectionsInCollection, getItemsInCollection } from '../../REST/collections';
import { removeTopology } from '../../components/utils/removeTopology';
import { Collection } from '../../types/Collection';
import { ItemWithType, CollectionWithType } from '../../components/collection/ViewCollection';
import { S3File } from '../../types/s3File';
import { getItem } from '../../REST/items';
import { FETCH_COLLECTION_LOAD_MORE } from '../../reducers/collections/viewCollection';

// Defining our Actions for the reducers.
export const FETCH_COLLECTION = 'FETCH_COLLECTION';
export const FETCH_COLLECTION_ERROR = 'FETCH_COLLECTION_ERROR';
export const FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION = 'FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION';

const removeTopologyAddType = (geoData: any, type: 'item' | 'collection'): ItemWithType[] | CollectionWithType[] => { // tslint:disable-line: no-any
  const geometries = geoData.objects.output.geometries;
  const data = geometries.map( e => e.properties );

  if (type === 'item') {
    const items = data as ItemWithType[];
    items.forEach(i => Object.assign(i, { dataType: 'item' }));
    return items;
  } else {
    const collections = data as CollectionWithType[];
    collections.forEach(i => Object.assign(i, { dataType: 'collection' }));
    return collections;
  }

};

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
    dispatch({
       type: LOADINGOVERLAY,
       on: false
     });
    return prevState.viewCollection;

  } else {

    try {
      const response = await getById(id);
      const collection = removeTopology(response) as Collection[];

      if (!!collection && !!collection[0] && Object.keys(collection).length) {
        dispatch({
           type: FETCH_COLLECTION,
           collection: collection[0]
        });

        // Load initial 10 items/collections.
        dispatch(await loadMore(id, 0));

      } else {
        dispatch({
         type: FETCH_COLLECTION_ERROR_NO_SUCH_COLLECTION,
         collection: undefined,
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

export const loadMore = async (id: string, offset: number = 0) => async (dispatch, getState) => {
  try {
    const itemResponse = await getItemsInCollection({id, limit: 10, offset});
    const collectionResponse = await getCollectionsInCollection({id, limit: 10, offset});

    const data = [...removeTopologyAddType(itemResponse, 'item'), ...removeTopologyAddType(collectionResponse, 'collection')];

    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        if (data[i]) {
          let file: S3File | false = false;
          if (data[i].dataType === 'item') {
            file = await checkFile(data[i] as unknown as Item);
          } else if (data[i].dataType === 'collection') {
            console.log('here');
            const collection: Collection = data[i] as Collection;
            console.log('collection', collection);
            if (collection && collection.s3_key && collection.s3_key.length) {
              if (collection.s3_key[0]) {
                const getItemResponse: Item[] = removeTopology(await getItem({s3Key: collection.s3_key[0]})) as Item[];
                file = await checkFile(getItemResponse[0]);
              }
            }
          }

          if (file) {
            Object.assign(data[i], {file});
          }
        }
      }

      dispatch({
         type: FETCH_COLLECTION_LOAD_MORE,
         data,
         offset
       });
    }
  } catch (e) {
    dispatch({
      type: FETCH_COLLECTION_ERROR,
      errorMessage: e
    });
  }
};
