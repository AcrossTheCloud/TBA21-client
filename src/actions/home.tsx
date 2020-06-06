import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import { getCDNObject } from '../components/utils/s3File';
import config from 'config';
import { FileTypes, S3File } from '../types/s3File';
import { itemType } from '../types/Item';
import { COLLECTION_MODAL_TOGGLE } from './modals/collectionModal';
import { ITEM_MODAL_TOGGLE } from './modals/itemModal';
import { LIVESTREAM_MODAL_TOGGLE } from './modals/liveStreamModal';
import * as React from 'react';
import ReactGA from 'react-ga';
import {
  DetailPreview,
  getItemsAndCollectionsForCollection
} from '../components/utils/DetailPreview';
import { Button, Col } from 'reactstrap';
import AudioPreview from '../components/layout/audio/AudioPreview';
import { FaCircle } from 'react-icons/all';
import { search as dispatchSearch, toggle as searchOpenToggle } from './searchConsole';
import { toggle as collectionModalToggle } from 'actions/modals/collectionModal';
import { toggle as itemModalToggle } from 'actions/modals/itemModal';
import { createCriteriaOption } from 'components/search/SearchConsole';

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

export const liveStreamDispatch = (state: boolean) => async dispatch => {
  if (state) {
    try {
      let response = await fetch(window.location.hostname.match(/staging/) ? 'https://api.twitch.tv/helix/streams?user_login=acrossthecloud' : 'https://api.twitch.tv/helix/streams?user_login=oceanarchive', {
        mode: 'cors',
        method: 'GET',
        headers: {
          "Accept":"application/vnd.twitchtv.v5+json",
          "Client-ID":"w2yn7cjtbiqasqb00yfmmcimneu51k",
          "Authorization":"Bearer 5sf0800ormqxpvvqiyyq4p03lakqdm"
        }
      });
      let responseJSON = await response.json();
      if (responseJSON.data.length > 0) {
        dispatch({
          type: LIVESTREAM_MODAL_TOGGLE,
          open: state,
          hasOpened: true,
          channel: window.location.hostname.match(/staging/) ? 'acrossthecloud' : 'oceanarchive'
        });
      }
    } catch (e) {
      console.log('error: ', e);
    }
  } else {
    dispatch({
     type: LIVESTREAM_MODAL_TOGGLE,
     open: state,
    });
  }
}

export const dateFromTimeYearProduced = (time: string | null, year: string | null, end_year: string | null = null): string => {
  const timeProduced = time ? new Date(time).getFullYear().toString() : undefined;
  const yearProduced = year ? (
    end_year ?
      year + '–' + end_year :
      year
    ) : undefined;
  return yearProduced ? yearProduced : (timeProduced ? timeProduced : '');
};

// @todo should be a util / dispatch
export const onTagClick = (event: React.MouseEvent<HTMLButtonElement>, label: string, field: string) => dispatch => {
  event.preventDefault();
  event.stopPropagation();

  setTimeout(() => {
    dispatch(collectionModalToggle(false));
    dispatch(itemModalToggle(false));
    dispatch(searchOpenToggle(true));
    dispatch(dispatchSearch([createCriteriaOption(label, field)]));
  });
};

export const loadHomepage = () => async dispatch => {
  const
    oaHighlights: {oa_highlight_items: HomepageData[], oa_highlight_collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: {oa_highlight: true}});

  oaHighlights.oa_highlight_collections = [ ...await getItemsAndCollectionsForCollection(oaHighlights.oa_highlight_collections as any)] as any;
  let highlightsWithFiles = await addFilesToData(oaHighlights.oa_highlight_collections);
  highlightsWithFiles = highlightsWithFiles.concat(await addFilesToData(oaHighlights.oa_highlight_items));
  highlightsWithFiles = highlightsWithFiles.slice(0,3); // max 3 highlights

  const  queryStringParams = {
      oa_highlight: false
    };

  let response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: queryStringParams });
  response.collections = [...await getItemsAndCollectionsForCollection(response.collections as any)] as any;

  const announcementResponse = await API.get('tba21', 'announcements', { queryStringParameters: { limit: '9'}});


  const HighlightsItemDetails = (props: { index: number }) => {
    let data = highlightsWithFiles[props.index];
    const tags = data.concept_tags;
    const creators = !!data.creators ? data.creators : [];

    return (
      <>
        <div className="title-wrapper" style={{marginTop: 10, marginBottom: 10}} onClick={() => dispatch(openModal(data))}>
          {creators && creators.length ?
            <div className="creators d-inline">
              {creators[0]}{creators.length > 1 ? <em>, et al.</em> : <></>}
              <div className="d-inline-block dotwrap">
                <FaCircle className="dot"/>
              </div>
            </div>
            : <></>
          }
          <div className="title d-inline" onClick={() => dispatch(openModal(data))}>
            {data.title.length > 45 ? data.title.substr(0, 44) + '...' : data.title}
          </div>
        </div>
        {!!tags && tags.length ?
          <div className="tagWrapper tags d-none d-lg-block" style={{marginTop: 10, marginBottom: 10}}>
            {
              tags.map((t) => (
                <Button
                  className="page-link tag d-inline-block"
                  style={{padding: 0, marginBottom: 10, background: 'none'}}
                  key={`highlight_tag_${props.index}_${t}`}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => dispatch(onTagClick(e, t as unknown as string, 'concept_tag'))}
                >
                  #{t}
                </Button>
              ))
            }
          </div>
          : <></>
        }
      </>
    );
  };

  const HighLightsLayout = (props: { index: number }) => {
    let colSizes: number[] = [];
    switch (highlightsWithFiles.length) {
      case 1:
        colSizes = [12, 0, 0];
        break;
      case 2:
        colSizes = [7, 5, 0];
        break;
      default:
        colSizes = [4, 4, 4];
        break;
    }
    const data = highlightsWithFiles[props.index];
    return (
      <Col xs="12" lg={colSizes[props.index]} className="item" onClick={() => { if (data.item_type !== itemType.Audio || (data.file && data.file.type) !== FileTypes.Audio) { dispatch(openModal(data)); }}}>
        {(data.item_type !== itemType.Audio || (data.file && data.file.type) !== FileTypes.Audio) ?
          <DetailPreview data={data} isOaHighlight={true} /> :
          <HomePageAudioPreview data={data} isOaHighlight={true} />
        }
        <HighlightsItemDetails index={props.index}/>
      </Col>
    );

  };

  const
    items = response.items,
    collections = response.collections,
    announcements = announcementResponse.announcements,
    loadedHighlights = highlightsWithFiles.map( (oa: HomepageData, i: number) => <HighLightsLayout index={i} key={i} />);

  dispatch({
    type: LOAD_HOMEPAGE,
    items,
    collections,
    announcements,
    loaded_highlights: loadedHighlights
  });
};

/**
 * HEADS all files and inserts a file key value pair into the item/collection.
 * @param data
 */
export const addFilesToData = async (data) => {
  if (data && data.length) {
    // Loop through each object in the array and get it's File from CloudFront
    for (let i = 0; i < data.length; i++) {
      const
        s3Key = data[i].s3_key,
        result = await getCDNObject(s3Key);

      if (result) {
        const file: S3File = result;

        if (file.type === FileTypes.Image) {
          const thumbnailUrl = `${config.other.THUMBNAIL_URL}${s3Key}`;
          let thumbnails = {};

          if (typeof data[i].file_dimensions !== 'undefined') {
            const dimensions: number[] = data[i].file_dimensions as number[];

            if (dimensions && dimensions[0]) {
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
        }

        Object.assign(data[i], {file : { ...data[i].file, ...file }});
      }
    }
    return data;
  } else {
    return [];
  }
};

export const loadMore = () => async (dispatch, getState) => {
  dispatch({ type: LOAD_MORE_LOADING, loading: true });
  let
    itemRand = 3,
    collectionRand = 3,
    state = getState(),
    {
      items,
      collections,
      loadedItems,
      loadedCount
    } = state.home;

  let numAudio: number = items.slice(0, itemRand).reduce((summary, item) => {
    if (item.item_type === 'Audio') {
      return summary + 1;
    } else {
      return summary
    }
  }, 0);

  if (numAudio) {
    itemRand += numAudio;
    items.sort((a,b) => {
      if (a.item_type==='Audio' && b.item_type!=='Audio') {
        return -1;
      } else if (a.item_type!=='Audio' && b.item_type==='Audio') {
        return 1;
      } else {
        return 0;
      }
    });
  }

  let data: HomepageData[] = [
    ...items.length > itemRand ? items.splice(0, itemRand) : items.splice(0, items.length),
    ...collections.length > collectionRand ? collections.splice(0, collectionRand) : collections.splice(0, collections.length)
  ];

  data = await addFilesToData(data);

  const Layout = (props: {data: HomepageData}): JSX.Element => {
    const {
      file,
      item_type
    } = props.data;

    if (!file) { return <></>; }

    return (
      <Col lg={item_type === itemType.Audio || file.type === FileTypes.Audio ? 12 : 4} className="pt-4">
        {item_type === itemType.Audio || file.type === FileTypes.Audio ?
          <HomePageAudioPreview data={props.data} openModal={() => dispatch(openModal(props.data))} />
          :
          <div onClick={() => dispatch(openModal(props.data))}>
            <DetailPreview data={props.data} onLoad={() => dispatch(waitForLoad(loadedCount - 1))}/>
          </div>
        }
      </Col>
    );
  };

  const allItems = [
    ...loadedItems,
    ...data.map( (e: HomepageData, i: number) => (<Layout key={loadedItems.length + i} data={e} />))
  ];

  dispatch({
   type: LOAD_MORE_HOMEPAGE,
   items: items,
   collections: collections,
   loadedMore: true,
   loadedCount: allItems.length,
   loadedItems: allItems
 });
  dispatch({ type: LOAD_MORE_LOADING, loading: false });
};

const waitForLoad = (loadedCount: number) => dispatch => {
  dispatch({ type: LOAD_COUNT_HOMEPAGE, loadedCount: loadedCount });
};

// Modal
export const openModal = (data: HomepageData) => dispatch => {
  if (data.hasOwnProperty('count') || data.hasOwnProperty('items') || data.hasOwnProperty('type')) {
    // We have a collection.
    ReactGA.modalview('/collection/'+data.id);
    dispatch({
     type: COLLECTION_MODAL_TOGGLE,
     open: true,
     data
   });
  } else {
    ReactGA.modalview('/view/'+data.id);
    dispatch({
       type: ITEM_MODAL_TOGGLE,
       open: true,
       data
     });
  }
};

export const HomePageAudioPreview = (props: { data: HomepageData, openModal?: Function, isOaHighlight?: boolean }) => {
  let {
    id,
    count,
    item_subtype,
    item_type,
    title,
    file,
    creators,
    year_produced,
    end_year_produced,
    time_produced
  } = props.data;

  if (props.isOaHighlight) { // don't display creator and title as these are displayed anyway
    title = '';
    creators = [];
  }

  const date = dateFromTimeYearProduced(time_produced, year_produced, end_year_produced);

  return (
    <>
      {item_type === itemType.Audio || (!!file && file.type === FileTypes.Audio) ?
        !!count && count > 0 ?
          <div onClick={() => typeof props.openModal === 'function' ? props.openModal(props.data) : false}>
            <AudioPreview noClick data={{title, id, url: file.url, date, creators, item_subtype, isCollection: !!count}}/>
          </div> :
          <AudioPreview data={{title, id, url: file.url, date, creators, item_subtype, isCollection: !!count}}/>
        : <></>
      }
    </>
  );
}
