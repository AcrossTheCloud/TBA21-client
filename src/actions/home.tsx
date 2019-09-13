import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import * as React from 'react';
import { random } from 'lodash';
import { getCDNObject } from '../components/utils/s3File';
import config from 'config';
import { FileTypes, S3File } from '../types/s3File';
import { Document, Page, pdfjs } from 'react-pdf';
import { Announcement } from '../types/Announcement';

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

  // Put all audio files into another list.
  const audio: HomepageData[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].item_type === FileTypes.Audio) {
      audio.push(items[i]);
      items.splice(i, 1);
    }
  }

  dispatch({
    type: LOAD_HOMEPAGE,
    items,
    audio,
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

export const loadMore = (items: HomepageData[], collections: HomepageData[], alreadyLoaded: JSX.Element[]) => async dispatch => {
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

  if (data.length) {
    for (let i = 0; i < data.length; i++) {
      const
        file = data[i].file,
        columnSizing = colSize(!!file ? file.type : 'image');

      let result: JSX.Element = await displayLayout(data[i], columnSizing, dispatch);

      if (file && file.type === 'audio') {
        const {title, id, creators, type, date} = data[i];
        result = (<Col xs="12" key={id}><AudioPreview data={{title, id, url: file.url, date, creators, type }} /></Col>);
      }

      layout.push(result);

    }
  }

  dispatch({
   type: LOAD_MORE_HOMEPAGE,
   items: items,
   collections: collections,
   audio: audio,
   loadedItems: [
     ...alreadyLoaded,
     ...data
   ],
 });
};

export const FilePreviewHome = (props: { data: HomepageData }): JSX.Element => {
  if (props.data.file && props.data.file.url) {
    if (props.data.file.type === FileTypes.Image) {
      let thumbnails: string = '';
      if (props.data.file.thumbnails) {
        Object.entries(props.data.file.thumbnails).forEach( ([key, value]) => {
          thumbnails = `${thumbnails}, ${value} ${key}w,`;
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
    if (props.data.file.type === FileTypes.Video) {
      return (
        <VideoPoster data={props.data} />
      );
    }
    if (props.data.file.type === FileTypes.Pdf) {
      return (
        <div className="pdf">
          <Document file={{ url: props.data.file.url }} style={{width: '100%', height: '100%'}} >
            <Page pageNumber={1}/>
          </Document>
        </div>
      );
    }

    if (props.data.file.type === FileTypes.DownloadText || props.data.file.type === FileTypes.Text) {
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

export const openModal = (data: HomepageData) => dispatch => {
  dispatch({
    type: MODAL_STATE_HOMEPAGE,
     isModalOpen: true,
     modalData: data
  });
};
