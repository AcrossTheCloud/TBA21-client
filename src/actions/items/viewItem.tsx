import { getItemUrls, checkThumbnails } from '../../components/utils/s3File';
import { Item } from '../../types/Item';
import { FileTypes, S3File } from '../../types/s3File';
import { LOADINGOVERLAY } from '../loadingOverlay';
import { getItem } from '../../REST/items';
import { removeTopology } from '../../components/utils/removeTopology';

// Defining our Actions for the reducers.
export const FETCH_ITEM = 'FETCH_ITEM';
export const FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';
export const FETCH_ITEM_ERROR_NO_SUCH_ITEM = 'FETCH_ITEM_ERROR_NO_SUCH_ITEM';

export const checkFile = async (item: Item): Promise<S3File | false> => {
  try {
    if (item.file && item.file.url) { return item.file; }
    const result = await getItemUrls(item.s3_key, item.url ? item.url : undefined);

    if (result && result.type === FileTypes.Image) {
      Object.assign(result, checkThumbnails(item, result));
    }

    return result;
  } catch (e) {
    return false;
  }
};

/**
 *
 * API call to fetch item information based on the itemID and dispatch it through to Redux
 *
 * @param id {string}
 */
export const fetchItem = (id: string) => async (dispatch, getState) => {
  dispatch({ type: LOADINGOVERLAY, on: true }); // Turn on the loading overlay

  const prevState = getState();

  // Detect if we have the same itemID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewItem.item && id === prevState.viewItem.item.id) {
    dispatch({ type: LOADINGOVERLAY, on: false }); // Turn off the loading overlay
    return prevState.viewItem;
  } else {

    try {
      const response = await getItem({ id });
      const items = removeTopology(response) as Item[];

      if (!!items && items[0]) {
        const item = items[0];

        // Get the items file
        const file = await checkFile(item);
        if (file) {
          Object.assign(item, {file: file});
        }

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
    } finally {
      dispatch({ type: LOADINGOVERLAY, on: false }); // Turn off the loading overlay
    }
  }
};
