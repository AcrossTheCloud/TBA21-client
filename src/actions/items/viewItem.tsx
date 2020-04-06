import { getCDNObject, checkThumbnails } from '../../components/utils/s3File';
import { Item } from '../../types/Item';
import { FileTypes, S3File } from '../../types/s3File';
import { LOADINGOVERLAY } from '../loadingOverlay';
import { getItem, getItems } from '../../REST/items';
import { removeTopology } from '../../components/utils/removeTopology';

// Defining our Actions for the reducers.
export const FETCH_ITEM = 'FETCH_ITEM';
export const FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';
export const FETCH_ITEM_ERROR_NO_SUCH_ITEM = 'FETCH_ITEM_ERROR_NO_SUCH_ITEM';

export const checkFile = async (item: Item): Promise<S3File | false> => {
  try {
    if (item.file && item.file.url) { return item.file; }
    const result = await getCDNObject(item.s3_key);

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
  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i;

  // Detect if we have the same itemID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewItem.item && id === prevState.viewItem.item.id) {
    dispatch({ type: LOADINGOVERLAY, on: false }); // Turn off the loading overlay
    return prevState.viewItem;
  } else {

    try {
      // match the incoming id to a uuid or item id to determine what api method we call
      const response = id.match(uuidRegex) ?  await getItems({ uuid: id }) : await getItem({ id: id });
      const items = await removeTopology(response) as Item[];
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
