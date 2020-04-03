import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import { random } from 'lodash';
import { getCDNObject } from '../components/utils/s3File';
import config from 'config';
import { FileTypes, S3File } from '../types/s3File';
import { itemType } from '../types/Item';
import { COLLECTION_MODAL_TOGGLE } from './modals/collectionModal';
import { ITEM_MODAL_TOGGLE } from './modals/itemModal';
import { LIVESTREAM_MODAL_TOGGLE } from './modals/liveStreamModal';
import * as React from 'react';
import { DetailPreview, FileStaticPreview, getItemsAndCollectionsForCollection } from '../components/utils/DetailPreview';
import { Button, Col, Row } from 'reactstrap';
import AudioPreview from '../components/layout/audio/AudioPreview';
import { FaCircle, FaPlay } from 'react-icons/all';
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

const DATES_LIVESTREAM1 = {
  'begin': (new Date("2020-02-06T08:00Z")).getTime(),
  'end': (new Date("2020-02-06T17:45Z")).getTime(),
  'stream': 'all-atlantic-ocean-research-forum-1/embed'
};

const DATES_LIVESTREAM2 = {
  'begin': (new Date("2020-02-07T08:00Z")).getTime(),
  'end': (new Date("2020-02-07T15:00Z")).getTime(),
  'stream': 'all-atlantic-ocean-research-forum-2/embed'
};

export const logoDispatch = (state: boolean) => dispatch => {
  dispatch({
    type: LOGO_STATE_HOMEPAGE,
    logoLoaded: state
  });
};

export const liveStreamDispatch = (state: boolean) => async dispatch => {
  if (state) {
    if (Date.now() > DATES_LIVESTREAM1.begin && Date.now() < DATES_LIVESTREAM1.end) {
      dispatch({
        type: LIVESTREAM_MODAL_TOGGLE,
        open: state,
        hasOpened: true,
        stream: DATES_LIVESTREAM1.stream
      });
    } else if (Date.now() > DATES_LIVESTREAM2.begin && Date.now() < DATES_LIVESTREAM2.end) {
      dispatch({
        type: LIVESTREAM_MODAL_TOGGLE,
        open: state,
        hasOpened: true,
        stream: DATES_LIVESTREAM2.stream
     });
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
export const onTagClick = (event: MouseEvent, label: string, field: string) => dispatch => {
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
    oaHighlights: {oa_highlight: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: {oa_highlight: true, oaHighlightLimit: 2}}),
    queryStringParams = {
      oa_highlight: false
    };

  // Push the ID's into the queryString for the next API call, so it excludes them
  if (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length) {
    Object.assign(queryStringParams, { id: oaHighlights.oa_highlight.map(o => o.id) });
  }

  let response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: queryStringParams });
  response.collections = [...await getItemsAndCollectionsForCollection(response.collections as any)] as any;

  const announcementResponse = await API.get('tba21', 'announcements', { queryStringParameters: { limit: '9'}});

  const highlightsWithFiles = await addFilesToData(oaHighlights.oa_highlight);

  const HighlightsItemDetails = (props: { index: number }) => {
    const tags = highlightsWithFiles[props.index].concept_tags;
    const creators = !!highlightsWithFiles[props.index].creators ? highlightsWithFiles[props.index].creators : [];

    return (
      <>
        <div className="title-wrapper d-flex" onClick={() => dispatch(openModal(highlightsWithFiles[props.index]))}>
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
          <div className="title" onClick={() => dispatch(openModal(highlightsWithFiles[props.index]))}>
            {highlightsWithFiles[props.index].title}
          </div>
        </div>
        <div className="type" onClick={() => dispatch(openModal(highlightsWithFiles[props.index]))}>
          {highlightsWithFiles[props.index].item_subtype}, {dateFromTimeYearProduced(highlightsWithFiles[props.index].time_produced, highlightsWithFiles[props.index].year_produced)}
        </div>
        {!!tags && tags.length ?
          <div className="tags d-none d-lg-block">
            {
              tags.map(t => {
                return (
                    <Button
                        className="page-link"
                        style={{padding: 0, background: 'none'}}
                        key={(t as unknown as string)}
                        onClick={(e) => dispatch(onTagClick(e as unknown as MouseEvent, t as unknown as string, 'concept_tag'))}
                    >
                      #{(t as unknown as string)}
                    </Button>
                );
              })
            }
          </div>
          : <></>
        }
      </>
    );
  };

  const HighLightsLayout = (props: { index: number }) => {
    if (props.index === 0 && !!highlightsWithFiles[0]) {
      return (
        <Col xs="12" lg={highlightsWithFiles.length > 1 ? 8 : 12} className="item" onClick={() => { if (highlightsWithFiles[0].item_type !== itemType.Audio || (highlightsWithFiles[0].file && highlightsWithFiles[0].file.type) !== FileTypes.Audio) { dispatch(openModal(highlightsWithFiles[0])); }}}>
          <div className="detailPreview">
            {
              highlightsWithFiles[0].file ?
                highlightsWithFiles[0].item_type === itemType.Audio || highlightsWithFiles[0].file.type === FileTypes.Audio ?
                  <HomePageAudioPreview data={highlightsWithFiles[0]} openModal={() => dispatch(openModal(highlightsWithFiles[0]))} />
                  :
                  <>
                    <FileStaticPreview file={highlightsWithFiles[0].file} />
                    <HighlightsItemDetails index={0}/>
                  </>
                : <></>
            }
            {highlightsWithFiles[0].file.type === FileTypes.Video ?
              <div className="middle">
                <FaPlay/>
              </div>
              : <></>}
          </div>

        </Col>
      );
    } else if (props.index === 1 && !!highlightsWithFiles[1]) {
      return (
        <Col xs="12" lg="4" className="item" onClick={() => { if (highlightsWithFiles[1].item_type !== itemType.Audio || (highlightsWithFiles[1].file && highlightsWithFiles[1].file.type) !== FileTypes.Audio) { dispatch(openModal(highlightsWithFiles[1])); }}}>
          <Row className="d-none d-lg-block">
            <Col xs="12">
              <div className="detailPreview">
                {
                  highlightsWithFiles[1].file ?
                    highlightsWithFiles[1].item_type === itemType.Audio || highlightsWithFiles[1].file.type === FileTypes.Audio ?
                      <HomePageAudioPreview data={highlightsWithFiles[1]} openModal={() => dispatch(openModal(highlightsWithFiles[1]))} />
                      :
                      <FileStaticPreview file={highlightsWithFiles[1].file} />
                    : <></>
                }
                {highlightsWithFiles[1].file.type === FileTypes.Video ?
                  <div className="middle">
                    <FaPlay/>
                  </div>
                  : <></>}

              </div>
              <HighlightsItemDetails index={1}/>
            </Col>
          </Row>
          <Row className="d-lg-none py-4 py-lg-0">
            <Col xs="12">
              <div className="detailPreview">
                {
                  highlightsWithFiles[1].file ?
                    highlightsWithFiles[1].item_type === itemType.Audio || highlightsWithFiles[1].file.type === FileTypes.Audio ?
                      <HomePageAudioPreview data={highlightsWithFiles[1]} openModal={() => dispatch(openModal(highlightsWithFiles[1]))} />
                      :
                      <>
                        <FileStaticPreview file={highlightsWithFiles[1].file} />
                        <HighlightsItemDetails index={1}/>
                      </>

                    : <></>
                }
                {highlightsWithFiles[1].file.type === FileTypes.Video ?
                  <div className="middle">
                    <FaPlay/>
                  </div>
                  : <></>
                }
              </div>
            </Col>
          </Row>
        </Col>
      );
    } else {
      return <></>;
    }
  };

  const
    items = response.items,
    collections = response.collections,
    announcements = announcementResponse.announcements,
    loadedHighlights = highlightsWithFiles.map( (oa: HomepageData, i: number) => <HighLightsLayout index={i} key={i} />);

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
    itemRand = random(2, 3),
    collectionRand = random(2, 3),
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
          return 8;

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
