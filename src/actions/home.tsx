import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import { AudioPlayer } from '../components/utils/AudioPlayer';
import * as React from 'react';
import { random } from 'lodash';
import { getCDNObject } from '../components/utils/s3File';
import ReactPlayer from 'react-player';
import { Col, Row } from 'reactstrap';

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
  const threeMonthsEarlier: Date = new Date();
  threeMonthsEarlier.setMonth(threeMonthsEarlier.getMonth() - 3);

  const
    oaHighlights: {oa_highlight: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: {date: threeMonthsEarlier.toISOString(), oa_highlight: true}}),
    queryStringParams = {
      date: threeMonthsEarlier.toISOString(), // Minus 3 months.
      oa_highlight: false,
      id: (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length ? oaHighlights.oa_highlight.map(o => o.id) : [])
    },
    response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'pages/homepage', { queryStringParameters: queryStringParams });

  dispatch({
    type: LOAD_HOMEPAGE,
    items: await addFilesToData(response.items),
    collections: await addFilesToData(response.collections),
    loaded_highlights: await addFilesToData(oaHighlights.oa_highlight)
  });
};

const addFilesToData = async (data: HomepageData[]): Promise<HomepageData[] | void> => {
  if (data && data.length) {
    // Loop through each object in the array and get it's File from CloudFront
    for (let i = 0; i < data.length; i++) {
      if (!data[i].hasOwnProperty('file')) {
        const getFile = async (key: string): Promise<void> => {
          const result = await getCDNObject(key);
          if (result) {
            Object.assign(data[i], {file: result});
          }
        };

        await getFile(data[i].s3_key);
      }
    }
    return data;
  }
};

export const loadMore = (items: [], collections: [], alreadyLoaded: JSX.Element[]) => async dispatch => {
  const
    itemRand = random(2, 4),
    collectionRand = random(2, 4);

  const displayResults = async (): Promise<JSX.Element> => {
    const layout: JSX.Element[] = [];
    const data: HomepageData[] = [...items.splice(0, itemRand), ...collections.splice(0, collectionRand)];

    for (const info of data) {
      layout.push((
        <Col key={`${info.s3_key}-${!!info.count ? 'collection' : 'item'}`}>
          <div className="item">
            <div className="file">
              {info.file ? <FileType data={info}/> : <></>}
            </div>
            <div className="overlay">
              <div className="type">
                {info.type}
              </div>
              <div className="title">
                {info.title}
              </div>
            </div>
          </div>
        </Col>
      ));
    }

    return (
      <Row key={Date.now()}>
        {layout}
      </Row>
    );
  };

  const
    results = await displayResults();

  dispatch({
   type: LOAD_MORE_HOMEPAGE,
   items: items,
   collections: collections,
   loadedItems: [
     ...alreadyLoaded,
     results
   ]
 });
};

export const FileType = (props: { data: HomepageData }): JSX.Element => {
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
          <ReactPlayer className="embed-responsive-item" url={props.data.file.url} height="auto" width="100%" vertical-align="top" />
        </div>
      );
    }
  }
  return <></>;
};
