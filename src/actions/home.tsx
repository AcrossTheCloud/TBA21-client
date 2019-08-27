import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import { AudioPlayer } from '../components/utils/AudioPlayer';
import * as React from 'react';
import { random, findIndex, matchesProperty } from 'lodash';
import { getCDNObject } from '../components/utils/s3File';
import ReactPlayer from 'react-player';
import { Col } from 'reactstrap';
import config from '../dev-config';
import { S3File } from '../types/s3File';
import { FaPlay } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
    oaHighlights: {oa_highlight: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: {oa_highlight: true}}),
    queryStringParams = {
      oa_highlight: false
    };

  if (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length) {
    Object.assign(queryStringParams, { id: oaHighlights.oa_highlight.map(o => o.id) });
  }

  const response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: queryStringParams });

  const
    items = await addFilesToData(response.items),
    collections = await addFilesToData(response.collections),
    loadedHighlights = await addFilesToData(oaHighlights.oa_highlight);

  dispatch({
    type: LOAD_HOMEPAGE,
    items,
    collections,
    loaded_highlights: loadedHighlights
  });
};

/**
 * HEADS all files and inserts a file key value pair into the item/collection.
 * @param data
 */
const addFilesToData = async (data: HomepageData[]): Promise<HomepageData[]> => {
  if (data && data.length) {
    // Loop through each object in the array and get it's File from CloudFront
    for (let i = 0; i < data.length; i++) {
      const s3Key = data[i].s3_key;
      const result = await getCDNObject(s3Key);
      if (result) {
        const file: S3File = result;

        if (result.type === 'image') {
          const thumbnailUrl = `${config.other.THUMBNAIL_URL}${s3Key}`;
          let thumbnails = {};

          if (!!data[i].file_dimensions) {
            if (data[i].file_dimensions[0] > 540) {
              Object.assign(thumbnails, {540: `${thumbnailUrl}.thumbnail540.png`});
            }
            if (data[i].file_dimensions[0] > 720) {
              Object.assign(thumbnails, {720: `${thumbnailUrl}.thumbnail720.png`});
            }
            if (data[i].file_dimensions[0] > 960) {
              Object.assign(thumbnails, {960: `${thumbnailUrl}.thumbnail960.png`});
            }
            if (data[i].file_dimensions[0] > 1140) {
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

export const loadMore = (items: HomepageData[], collections: HomepageData[], alreadyLoaded: JSX.Element[]) => async dispatch => {
  const
    itemRand = random(2, 4),
    collectionRand = random(2, 4);

  const layout: JSX.Element[] = [];

  let data: HomepageData[] = [
    ...items.length > itemRand ? items.splice(0, itemRand) : items.splice(0, items.length),
    ...collections.length > itemRand ? collections.splice(0, collectionRand) : collections.splice(0, items.length)
  ];

  if (data.length) {
    for (let i = 0; i < data.length; i++) {
      const
        file = data[i].file,
        columnSizing = colSize(!!file ? file.type : 'image');

      let
        nextCount = i,
        nextFile = data[nextCount++];

      let result: JSX.Element | undefined = await displayLayout(data[i], columnSizing, dispatch);
      if (result) {
        layout.push(result);

        if (file && file.type === 'audio' && nextFile && nextFile.file && nextFile.file.type !== 'audio' && columnSizing <= 8) {
          const
            image: number = findIndex(items, matchesProperty('file.type', 'image')),
            sliced: HomepageData[] = image ? items.slice(0, image) : [];

          if (sliced && sliced.length) {
            console.log('EXTRA!');
            result = await displayLayout(sliced[0], 12 - columnSizing, dispatch);
            if (result) {
              layout.push(result);
            }
          }
        }
      }
    }
  }

  dispatch({
   type: LOAD_MORE_HOMEPAGE,
   items: items,
   collections: collections,
   loadedItems: [
     ...alreadyLoaded,
     ...layout
   ]
 });
};

const displayLayout = (data: HomepageData, columnSize: number, dispatch: Function) => {
  if (!data) { return; }
  const {
    s3_key,
    count,
    type,
    title,
    file,
    duration,
    creators
  } = data;

  return (
    <Col key={`${s3_key}-${!!count ? 'collection' : 'item'}`} md={columnSize}>
      <div className="item" onClick={() => openModalWithoutDispatch(data, dispatch)}>
        {file ?
          <div className="file">
            <FilePreviewHome data={data}/>
          </div>
        : <></> }
        <div className="type">
          {type}
        </div>
        <div className="title">
          {!!creators ? creators.map(c => `${c} - `) : <></>}{title}
        </div>
        {duration ?
          <div className="duration">
            {duration}
          </div>
        : <></> }
      </div>
    </Col>
  );
};
const colSize = (fileType: string): number => {
  switch (fileType) {
    case 'audio':
      return 12;

    case 'video':
      return 8;

    default:
      return 4;
  }
};

export const FilePreview = (props: { data: HomepageData }): JSX.Element => {
  if (props.data.file && props.data.file.url) {
    if (props.data.file.type === 'image') {
      let thumbnails: string = '';
      if (props.data.file.thumbnails) {
        Object.entries(props.data.file.thumbnails).forEach( ([key, value]) => {
          thumbnails = `${thumbnails} ${value} ${key}w`;
        } );
      }

      return (
        <img
          srcSet={thumbnails}
          src={props.data.file.url}
          alt={props.data.title}
        />
      );
    }
    if (props.data.file.type === 'audio') {
      return <AudioPlayer url={props.data.file.url} id={props.data.id} />;
    }
    if (props.data.file.type === 'video') {
      return (
        <div className="embed-responsive embed-responsive-16by9">
          <ReactPlayer
            controls
            light={props.data.file.poster}
            className="embed-responsive-item"
            url={!!props.data.file.playlist ? props.data.file.playlist : props.data.file.url}
            height="auto"
            width="100%"
            vertical-align="top"
          />
        </div>
      );
    }
    if (props.data.file.type === 'pdf') {
      return (
        <div className="embed-responsive embed-responsive-4by3">
          <iframe title={props.data.title} className="embed-responsive-item" src={props.data.file.url} />
        </div>
      );
    }

    if (props.data.file.type === 'downloadText' || props.data.file.type === 'text') {
      return (
        <a href={props.data.file.url} target="_blank" rel="noopener noreferrer">
          <img alt={props.data.title} src="https://upload.wikimedia.org/wikipedia/commons/2/22/Unscharfe_Zeitung.jpg" className="image-fluid"/>
        </a>
      );
    }
  }
  return <></>;
};
export const FilePreviewHome = (props: { data: HomepageData }): JSX.Element => {
  if (props.data.file && props.data.file.url) {
    if (props.data.file.type === 'image') {
      let thumbnails: string = '';
      if (props.data.file.thumbnails) {
        Object.entries(props.data.file.thumbnails).forEach( ([key, value]) => {
          thumbnails = `${thumbnails}, ${value} ${key}w`;
        } );
      }
      return (
        <img
          srcSet={thumbnails}
          src={props.data.file.url}
          alt={props.data.title}
        />
      );
    }
    if (props.data.file.type === 'audio') {
      return <AudioPlayer url={props.data.file.url} id={props.data.id} />;
    }
    if (props.data.file.type === 'video') {
      return (
        <VideoPoster data={props.data} />
      );
    }
    if (props.data.file.type === 'pdf') {
      return (
        <Document file={{ url: props.data.file.url }} >
          <Page pageNumber={1}/>
        </Document>
      );
    }

    if (props.data.file.type === 'downloadText' || props.data.file.type === 'text') {
      return (
        <a href={props.data.file.url} target="_blank" rel="noopener noreferrer">
          <img alt={props.data.title} src="https://upload.wikimedia.org/wikipedia/commons/2/22/Unscharfe_Zeitung.jpg" className="image-fluid"/>
        </a>
      );
    }
  }
  return <></>;
};
export const VideoPoster = (props: { data: HomepageData }) => (
  <div className="videoPreview">
    {!!props.data.file ? <img src={props.data.file.poster} alt={''}/> : <></>}
    <div className="playButton">
      <FaPlay />
    </div>
  </div>
);
// Modal
export const closeModal = () => dispatch => {
  dispatch({
    type: MODAL_STATE_HOMEPAGE,
     isModalOpen: false,
    data: undefined
  });
};

const openModalWithoutDispatch = (data: HomepageData, dispatch: Function) => {
  dispatch({
    type: MODAL_STATE_HOMEPAGE,
     isModalOpen: true,
     modalData: data
  });
};
export const openModal = (data: HomepageData) => dispatch => {
  dispatch({
    type: MODAL_STATE_HOMEPAGE,
     isModalOpen: true,
     modalData: data
  });
};
