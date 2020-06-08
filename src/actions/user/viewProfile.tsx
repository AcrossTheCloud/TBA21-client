import { API } from 'aws-amplify';
import {
  FETCH_PROFILE,
  FETCH_PROFILE_ERROR,
  FETCH_PROFILE_ERROR_NO_SUCH_PROFILE,
  FETCH_PROFILE_ITEMS_AND_COLLECTIONS_LOADING,
  FETCH_PROFILE_ITEMS_AND_COLLECTIONS_SUCCEED,
  FETCH_PROFILE_ITEMS_AND_COLLECTIONS_ERROR,
  profileItemAndCollectionsFetchLimit,
} from '../../reducers/user/viewProfile';
import { LOADINGOVERLAY } from '../loadingOverlay';
import { getItems } from '../../REST/items';
import { removeTopology } from '../../components/utils/removeTopology';
import { Item } from 'types/Item';
import { getCollections } from 'REST/collections';
import { getItemsAndCollectionsForCollection } from 'components/utils/DetailPreview';
import { Collection } from 'types/Collection';
import addFilesToData from 'REST/utils/addFilesToData';
/**
 *
 * API call to fetch profile information based on the profileID and dispatch it through to Redux
 *
 * @param profileId {string}
 */
export const fetchProfile = (profileId: string) => async (dispatch, getState) => {
  const prevState = getState();
  dispatch({ type: LOADINGOVERLAY, on: true }); // Turn on the loading overlay

  // Detect if we have the same profileID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewItem.profile && profileId === prevState.viewItem.profile.profileId) {
    dispatch({ type: LOADINGOVERLAY, on: false }); // Turn off the loading overlay
    dispatch(fetchProfileItemsAndCollections())

  } else {
    try {
      const response = await API.get('tba21', 'profiles', {
        queryStringParameters: {
          id: profileId
        }
      });

      if (!!response.profile && response.profile.length && response.profile[0]) {
        const profile = response.profile[0];

        dispatch({
           type: FETCH_PROFILE,
           profile: profile
         });
      } else {
        dispatch({
           type: FETCH_PROFILE_ERROR_NO_SUCH_PROFILE,
           profile: {}
         });
      }
    } catch (e) {
      dispatch({
         type: FETCH_PROFILE_ERROR
       });
    } finally {
      dispatch({ type: LOADINGOVERLAY, on: false }); // Turn off the loading overlay
      dispatch(fetchProfileItemsAndCollections())

    }
  }
};

export const fetchProfileItemsAndCollections = () => async (dispatch, getState) => {
  const state = getState().viewProfile

  if ((!state.itemsHasMore && !state.collectionsHasMore) || !state.profile?.cognito_uuid || state.isItemsAndCollectionsLoading) {
    return
  }

  dispatch({ type: FETCH_PROFILE_ITEMS_AND_COLLECTIONS_LOADING })

  const itemQueries = {
    limit: profileItemAndCollectionsFetchLimit,
    offset: state.items.length,
    uuid: state.profile.cognito_uuid,
  }

  const collectionQueries = {
    limit: profileItemAndCollectionsFetchLimit,
    offset: state.collections.length,
    uuid: state.profile.cognito_uuid,
  }

  try {
    let promises: Promise<any>[] = []

    if (state.itemsHasMore) {
      promises.push(getItems(itemQueries))
    } else {
      promises.push(Promise.resolve({}))
    }

    if (state.collectionsHasMore) {
      promises.push(getCollections(collectionQueries))
    } else {
      promises.push(Promise.resolve({}))
    }

    let [items, collections] = await Promise.all(promises)

    items = removeTopology(items, "item") as Item[]
    collections = removeTopology(collections, "collection")
    collections = await getItemsAndCollectionsForCollection(collections) as Collection[]

    let [itemsWithFile, collectionsWithFile] = await Promise.all([
      addFilesToData(items),
      addFilesToData(collections)
    ])

    const collectionsWithFileAndS3KeyImage = collectionsWithFile.map(d => ({
      ...d,
      s3_key: d.items && d.items.length ? d.items[0].s3_key : null
    }))

    dispatch({
      type: FETCH_PROFILE_ITEMS_AND_COLLECTIONS_SUCCEED,
      items: itemsWithFile,
      collections: collectionsWithFileAndS3KeyImage
    })
  } catch {
    dispatch({
      type: FETCH_PROFILE_ITEMS_AND_COLLECTIONS_ERROR,
    })
  }
}
