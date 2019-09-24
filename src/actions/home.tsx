import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import { random } from 'lodash';
import { getCDNObject } from '../components/utils/s3File';
import config from 'config';
import { FileTypes, S3File } from '../types/s3File';
import { Announcement } from '../types/Announcement';
import { itemType } from '../types/Item';
import { COLLECTION_MODAL_TOGGLE } from './modals/collectionModal';
import { ITEM_MODAL_TOGGLE } from './modals/itemModal';

// Defining our Actions for the reducers
export const LOGO_STATE_HOMEPAGE = 'LOGO_STATE_HOMEPAGE';
export const LOAD_HOMEPAGE = 'LOAD_HOMEPAGE';
export const LOAD_MORE_HOMEPAGE = 'LOAD_MORE_HOMEPAGE';
export const MODAL_STATE_HOMEPAGE = 'MODAL_STATE_HOMEPAGE';

export const logoDispatch = (state: boolean) => dispatch => {
  dispatch({
    type: LOGO_STATE_HOMEPAGE,
    logoLoaded: state
  });
};

export const loadHomepage = () => async dispatch => {
  const
    oaHighlights: {oa_highlight: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: {oa_highlight: true, oaHighlightLimit: 2}}),
    queryStringParams = {
      oa_highlight: false
    };

  if (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length) {
    Object.assign(queryStringParams, { id: oaHighlights.oa_highlight.map(o => o.id) });
  }

  const response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: queryStringParams });
  const announcementResponse = await API.get('tba21', 'announcements', { queryStringParameters: { limit: '1'}});

  const
    items = response.items,
    collections = response.collections,
    announcements = announcementResponse.announcements,
    loadedHighlights = await addFilesToData(oaHighlights.oa_highlight);

  // Put all audio files into another list.
  const audio: HomepageData[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].item_type === itemType.Audio) {
      audio.push(items[i]);
      items.splice(i, 1);
    }
  }

  dispatch({
    type: LOAD_HOMEPAGE,
    items,
    audio,
    collections,
    announcements,
    loaded_highlights: loadedHighlights
  });
};

/**
 * HEADS all files and inserts a file key value pair into the item/collection.
 * @param data
 */
export const addFilesToData = async (data: HomepageData[]): Promise<HomepageData[]> => {
  if (data && data.length) {
    // Loop through each object in the array and get it's File from CloudFront
    for (let i = 0; i < data.length; i++) {
      const
        isCollection: boolean = !!data[i].count,
        s3Key = isCollection ? data[i].s3_key[0] : data[i].s3_key, // if collection get the first s3_key
        result = await getCDNObject(s3Key);

      if (result) {
        const file: S3File = result;

        if (file.type === FileTypes.Image) {
          const thumbnailUrl = `${config.other.THUMBNAIL_URL}${s3Key}`;
          let thumbnails = {};

          if (typeof data[i].file_dimensions !== 'undefined') {
            const dimensions: number[] = data[i].file_dimensions as number[];

            if (dimensions[0] > 540) {
              Object.assign(thumbnails, {540: `${thumbnailUrl}.thumbnail540.png`});
            }
            if (dimensions[0] > 720) {
              Object.assign(thumbnails, {720: `${thumbnailUrl}.thumbnail720.png`});
            }
            if (dimensions[0] > 960) {
              Object.assign(thumbnails, {960: `${thumbnailUrl}.thumbnail960.png`});
            }
            if (dimensions[0] > 1140) {
              Object.assign(thumbnails, {1140: `${thumbnailUrl}.thumbnail1140.png`});
            }

            if (Object.keys(thumbnails).length > 1) {
              Object.assign(file, {thumbnails});
            }
          }
        }

        Object.assign(data[i], {file : { ...data[i].file, ...file }});
      }
    }
    return data;
  } else {
    return [];
  }
};

export const loadMore = (
    items: HomepageData[],
    collections: HomepageData[],
    announcements: Announcement[],
    audio: HomepageData[],
    alreadyLoaded: HomepageData[]
  ) => async dispatch => {
  const
    itemRand = random(2, 3),
    collectionRand = random(2, 3);

  let data: HomepageData[] = [
    ...items.length > itemRand ? items.splice(0, itemRand) : items.splice(0, items.length),
    ...collections.length > collectionRand ? collections.splice(0, collectionRand) : collections.splice(0, collections.length)
  ];

  // Push the audio to the end
  if (audio && audio.length) {
    data.push(...audio.splice(1));
  }

  // Add files to the items
  data = await addFilesToData(data);

  dispatch({
   type: LOAD_MORE_HOMEPAGE,
   items: items,
   collections: collections,
   audio: audio,
   loadedMore: true,
   loadedItems: [
     ...alreadyLoaded,
     ...data
   ],
 });
};

// Modal
export const openModal = (data: HomepageData) => dispatch => {
  if (data.hasOwnProperty('count') || data.hasOwnProperty('items') || data.hasOwnProperty('type')) {
    // We have a collection.
    dispatch({
     type: COLLECTION_MODAL_TOGGLE,
     open: true,
     data
   });
  } else {
    dispatch({
       type: ITEM_MODAL_TOGGLE,
       open: true,
       data
     });
  }
};
