import { API } from 'aws-amplify';
import { random } from 'lodash';

import { HomepageData } from '../types/Home';
import { itemType } from '../types/Item';
import addFilesToData from '../components/utils/add-files-to-data';

// Defining our Actions for the reducers
export const LOGO_STATE_HOMEPAGE = 'LOGO_STATE_HOMEPAGE';
export const LOAD_HOMEPAGE = 'LOAD_HOMEPAGE';
export const LOAD_MORE_HOMEPAGE = 'LOAD_MORE_HOMEPAGE';
export const LOAD_COUNT_HOMEPAGE = 'LOAD_COUNT_HOMEPAGE';
export const LOAD_MORE_LOADING = 'LOAD_MORE_LOADING';
export const MODAL_STATE_HOMEPAGE = 'MODAL_STATE_HOMEPAGE';

export const logoDispatch = (state: boolean) => dispatch => {
  dispatch({
    type: LOGO_STATE_HOMEPAGE,
    logoLoaded: state
  });
};

export const loadHomepage = () => async dispatch => {
  const
    oaHighlights: { oa_highlight: HomepageData[] } = await API.get(
      'tba21',
      'pages/homepage',
      { queryStringParameters: { oa_highlight: true, oaHighlightLimit: 2 } }
    ),
    queryStringParams = {
      oa_highlight: false
    };

  // Push the ID's into the queryString for the next API call, so it excludes them
  if (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length) {
    Object.assign(queryStringParams, {
      id: oaHighlights.oa_highlight.map(o => o.id)
    });
  }

  const response: {
    items: HomepageData[];
    collections: HomepageData[];
  } = await API.get('tba21', 'pages/homepage', {
    queryStringParameters: queryStringParams
  });

  const announcementResponse = await API.get('tba21', 'announcements', {
    queryStringParameters: { limit: '9' }
  });

  let highlightsWithFiles: HomepageData[] = [];
  if (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length) {
    highlightsWithFiles = await addFilesToData(oaHighlights.oa_highlight);
  }

  const items = response.items,
    collections = response.collections,
    announcements = announcementResponse.announcements;

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
    highlights: highlightsWithFiles
  });
};

export const loadMore = () => async (dispatch, getState) => {
  dispatch({ type: LOAD_MORE_LOADING, loading: true });
  const itemRand = random(2, 3),
    collectionRand = random(2, 3),
    state = getState(),
    { items, collections, audio, loadedItems } = state.home;

  let data: HomepageData[] = [
    ...(items.length > itemRand
      ? items.splice(0, itemRand)
      : items.splice(0, items.length)),
    ...(collections.length > collectionRand
      ? collections.splice(0, collectionRand)
      : collections.splice(0, collections.length))
  ];

  // Push the audio to the end
  if (audio && audio.length) {
    data.push(...audio.splice(0, 1));
  }

  data = await addFilesToData(data);

  const allItems = [...loadedItems, ...data];

  dispatch({
    type: LOAD_MORE_HOMEPAGE,
    items: items,
    collections: collections,
    audio: audio,
    loadedMore: true,
    loadedCount: allItems.length,
    loadedItems: allItems
  });
  dispatch({ type: LOAD_MORE_LOADING, loading: false });
};

export const waitForLoad = (loadedCount: number) => dispatch => {
  dispatch({ type: LOAD_COUNT_HOMEPAGE, loadedCount: loadedCount });
};
