import { API } from 'aws-amplify';
import { getCDNObject } from '../../components/utils/s3File';
import { Item } from '../../types/Item';
import { S3File } from '../../types/s3File';
import config from 'config';

// Defining our Actions for the reducers.
export const FETCH_ITEM = 'FETCH_ITEM';
export const FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';
export const FETCH_ITEM_ERROR_NO_SUCH_ITEM = 'FETCH_ITEM_ERROR_NO_SUCH_ITEM';

/**
 *
 * API call to fetch item information based on the itemID and dispatch it through to Redux
 *
 * @param id {string}
 */
export const fetchItem = (id: string) => async (dispatch, getState) => {
  const prevState = getState();

  const checkFile = async (item: Item): Promise<S3File | false> => {
    try {
      if (item.file && item.file.url) { return item.file; }
      const result = await getCDNObject(item.s3_key);

      if (result && result.type === 'image') {
        const thumbnailUrl = `${config.other.THUMBNAIL_URL}${item.s3_key}`;
        let thumbnails = {};

        if (!!item.file_dimensions) {
          if (item.file_dimensions[0] > 540) {
            Object.assign(thumbnails, {540: `${thumbnailUrl}.thumbnail540.png`});
          }
          if (item.file_dimensions[0] > 720) {
            Object.assign(thumbnails, {720: `${thumbnailUrl}.thumbnail720.png`});
          }
          if (item.file_dimensions[0] > 960) {
            Object.assign(thumbnails, {960: `${thumbnailUrl}.thumbnail960.png`});
          }
          if (item.file_dimensions[0] > 1140) {
            Object.assign(thumbnails, {1140: `${thumbnailUrl}.thumbnail1140.png`});
          }

          if (Object.keys(thumbnails).length > 1) {
            Object.assign(result, {thumbnails});
          }
        }
      }

      return result;
    } catch (e) {
      return false;
    }
  };

  // Detect if we have the same itemID and return the previous state.
  // We do this here to stop another API call and you can easily get the prevState in the Action.
  if (prevState.viewItem.item && id === prevState.viewItem.item.id) {
    return prevState.viewItem;
  } else {

    try {
      const response = await API.get('tba21', 'items/getItem', {
        queryStringParameters: {
          id: id
        }
      });

      if (!!response.item && Object.keys(response.item).length) {
        const item = response.item;

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
    }
  }
};
