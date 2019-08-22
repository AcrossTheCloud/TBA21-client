import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import { AudioPlayer } from '../components/utils/AudioPlayer';
import * as React from 'react';
import { random, findIndex, matchesProperty } from 'lodash';
import { getCDNObject } from '../components/utils/s3File';
import ReactPlayer from 'react-player';
// import { Document, pdfjs } from 'react-pdf';
import { Col } from 'reactstrap';
import { Link } from 'react-router-dom';
//
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Defining our Actions for the reducers
export const LOGO_STATE_HOMEPAGE = 'LOGO_STATE_HOMEPAGE';
export const LOAD_HOMEPAGE = 'LOAD_HOMEPAGE';
export const LOAD_MORE_HOMEPAGE = 'LOAD_MORE_HOMEPAGE';

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
      oa_highlight: false,
      id: (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length ? oaHighlights.oa_highlight.map(o => o.id) : [])
    },
    response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: queryStringParams });

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
      const result = await getCDNObject(data[i].s3_key);
      if (result) {
        Object.assign(data[i], {file: result});
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

      let result: JSX.Element | undefined = await displayLayout(data[i], columnSizing);
      if (result) {
        layout.push(result);

        if (file && file.type === 'audio' && nextFile && nextFile.file && nextFile.file.type !== 'audio' && columnSizing <= 8) {
          const
            image: number = findIndex(items, matchesProperty('file.type', 'image')),
            sliced: HomepageData[] = image ? items.slice(0, image) : [];

          if (sliced && sliced.length) {
            console.log('EXTRA!');
            result = await displayLayout(sliced[0], 12 - columnSizing);
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

const displayLayout = (data: HomepageData, columnSize: number) => {
  if (!data) { return; }
  const {
    s3_key,
    count,
    type,
    title,
    file,
  } = data;

  return (
    <Col key={`${s3_key}-${!!count ? 'collection' : 'item'}`} md={columnSize}>
      <div className="item">
        <div className="file">
          {file ? <FilePreview data={data}/> : <></>}
        </div>
        <div className="overlay">
          <div className="type">
            <Link to={`/view/${data.s3_key}`}>
              {type}
            </Link>
          </div>
          <div className="title">
            <Link to={`/view/${data.s3_key}`}>
              {title}
            </Link>
          </div>
        </div>
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
      return <img src={props.data.file.url} alt={props.data.title}/>;
    }
    if (props.data.file.type === 'audio') {
      return <AudioPlayer url={props.data.file.url} id={props.data.id} />;
    }
    if (props.data.file.type === 'video') {
      return (
        <div className="embed-responsive embed-responsive-16by9">
          <ReactPlayer controls light className="embed-responsive-item" url={props.data.file.url} height="auto" width="100%" vertical-align="top" />
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

    //         {/*<Document file={`${props.data.file.url}`} />*/}

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
