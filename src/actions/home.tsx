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
import {
  DetailPreview,
  FileStaticPreview,
  getItemsAndCollectionsForCollection
} from '../components/utils/DetailPreview';
import { Button, Col } from 'reactstrap';
import AudioPreview from '../components/layout/audio/AudioPreview';
import { FaCircle, FaPlay } from 'react-icons/all';
import { search as dispatchSearch, toggle as searchOpenToggle } from './searchConsole';
import { toggle as collectionModalToggle } from 'actions/modals/collectionModal';
import { toggle as itemModalToggle } from 'actions/modals/itemModal';
import { createCriteriaOption } from 'components/search/SearchConsole';
import {ReactComponent as CollectionsInCollectionIcon} from 'images/svgs/collections_in_collection.svg';
import {ReactComponent as CollectionIcon} from 'images/svgs/collection.svg';

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
      let response = await fetch('https://api.twitch.tv/helix/streams?user_login=oceanarchive', {
        mode: 'cors',
        method: 'GET',
        headers: {
          "Accept":"application/vnd.twitchtv.v5+json",
          "Client-ID":"brdrlyou2po431ot4owmi1zzjn6n0x"
        }
      });
      let responseJSON = await response.json();
      if (responseJSON.data.length > 0) {
        dispatch({
          type: LIVESTREAM_MODAL_TOGGLE,
          open: state,
          hasOpened: true,
          channel: 'acrossthecloud'
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

export const dateFromTimeYearProduced = (time: string | null, year: string | null): string => {
  const timeProduced = time ? new Date(time).getFullYear().toString() : undefined;
  const yearProduced = year ? year : undefined;
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
  console.log(oaHighlights);

  console.log(oaHighlights.oa_highlight_collections);
  oaHighlights.oa_highlight_collections = [ ...await getItemsAndCollectionsForCollection(oaHighlights.oa_highlight_collections as any)] as any;
  console.log(oaHighlights.oa_highlight_collections);
  let highlightsWithFiles = await addFilesToData(oaHighlights.oa_highlight_collections);
  highlightsWithFiles = highlightsWithFiles.concat(await addFilesToData(oaHighlights.oa_highlight_items));
  highlightsWithFiles.slice(0,3); // max 3 highlights

  const  queryStringParams = {
      oa_highlight: false
    };

  console.log(highlightsWithFiles);
  
  let response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: queryStringParams });
  response.collections = [...await getItemsAndCollectionsForCollection(response.collections as any)] as any;

  const announcementResponse = await API.get('tba21', 'announcements', { queryStringParameters: { limit: '9'}});


  const HighlightsItemDetails = (props: { index: number }) => {
    let data = highlightsWithFiles[props.index];
    const tags = data.concept_tags;
    const creators = !!data.creators ? data.creators : [];

    return (
      <>
        <div className="title-wrapper d-flex" onClick={() => dispatch(openModal(data))}>
          {creators && creators.length ?
            <div className="creators">
              {creators[0]}{creators.length > 1 ? <em>, et al.</em> : <></>}
            </div>
            : <></>
          }
          {creators && creators.length ?
            <div className="d-none d-md-block dotwrap">
              <FaCircle className="dot"/>
            </div>
            : <></>
          }
          <div className="title" onClick={() => dispatch(openModal(data))}>
            {data.title}
          </div>
        </div>
        <div className="type mb-2" onClick={() => dispatch(openModal(data))}>
          {data.item_subtype ? data.item_subtype : data.type}{data.time_produced || data.year_produced ? ', ' : '' }{dateFromTimeYearProduced(data.time_produced, data.year_produced)}
        </div>
        {!!tags && tags.length ?
          <div className="tagWrapper tags d-none d-lg-block">
            {
              tags.map((t) => (
                <Button
                  className="page-link tag d-inline-block"
                  style={{padding: 0, marginBottom: 5, background: 'none'}}
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
        <div className="detailPreview">
          {data.file ?
              data.item_type === itemType.Audio || data.file.type === FileTypes.Audio ?
                <HomePageAudioPreview data={data} openModal={() => dispatch(openModal(data))} />
                :
                <>
                  <FileStaticPreview file={data.file} />
                </>
              : <></>
          }
          {data.file.type === FileTypes.Video ?
            <div className="middle">
              <FaPlay/>
            </div>
            : <></>
          }
          {
            data.collections && data.collections.length ?
                (
                    <div
                      className="collections-count"
                    >
                      {data.collections.length} collection{data.collections.length > 1 ? 's' : ''}
                    </div>
                )
                :
                <></>
          }
          {
            !!data.items && data.items.length > 0 ?
                (
                    <div
                        className="item-count"
                    >
                      {data.items.length} item{data.items.length > 1 ? 's' : ''}
                    </div>
                )
                :
                <></>
          }
          {data.collections ? 
            <div className="middle">
              {data.collections && data.collections.length ?
                  (
                    <CollectionsInCollectionIcon />
                  )
                  :
                  (
                    <CollectionIcon />
                  )
              }
            </div>
            :
            <></>
          }
        </div>
        <HighlightsItemDetails index={props.index}/>
      </Col>
    );

  };

  const
    items = response.items.filter(item => item.item_type !== itemType.Audio),
    collections = response.collections,
    announcements = announcementResponse.announcements,
    loadedHighlights = highlightsWithFiles.map( (oa: HomepageData, i: number) => <HighLightsLayout index={i} key={i} />),
    audio: HomepageData[] = response.items.filter(item => item.item_type === itemType.Audio);

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
  const
    itemRand = 3,
    collectionRand = 3,
    state = getState(),
    {
      items,
      collections,
      audio,
      loadedItems,
      loadedCount
    } = state.home;

  let data: HomepageData[] = [
    ...items.length > itemRand ? items.splice(0, itemRand) : items.splice(0, items.length),
    ...collections.length > collectionRand ? collections.splice(0, collectionRand) : collections.splice(0, collections.length)
  ];

  // Push the audio to the end
  if (audio && audio.length) {   
    data.push(...audio.splice(0, 1));
    data = [
      ...items.length > (audio.length - 1) ? items.splice(0, (audio.length - 1)) : items.splice(0, items.length),
      ...collections.length > (audio.length > 1 ? 1 : 0) ? collections.splice(0, (audio.length > 1 ? 1 : 0)) : collections.splice(0, collections.length)
    ];
  }

  data = await addFilesToData(data);

  const Layout = (props: {data: HomepageData}): JSX.Element => {
    const {
      file,
      item_type
    } = props.data;

    if (!file) { return <></>; }

    const colSize = (fileType: string): number => {
      switch (fileType) {
        case 'Audio':
          return 12;

        case 'Video':
          return 4;

        default:
          return 4;
      }
    };

    return (
      <Col lg={colSize(!!file ? file.type : '')} className="pt-4">
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
   audio: audio,
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

export const HomePageAudioPreview = (props: { data: HomepageData, openModal?: Function }) => {
  const {
    id,
    count,
    item_subtype,
    item_type,
    title,
    file,
    creators,
    year_produced,
    time_produced
  } = props.data;

  const date = dateFromTimeYearProduced(time_produced, year_produced);

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
