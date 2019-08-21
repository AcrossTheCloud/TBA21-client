import { API } from 'aws-amplify';
import { HomepageData } from '../reducers/home';
import { AudioPlayer } from '../components/utils/AudioPlayer';
import * as React from 'react';
import { random, shuffle } from 'lodash';
import { getCDNObject } from '../components/utils/s3File';
import { Col } from 'reactstrap';
import ReactPlayer from 'react-player';

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
    oaHighlights: {oa_highlight: HomepageData[]} = await API.get('tba21', 'items/homepages', { queryStringParameters: {date: threeMonthsEarlier.toISOString(), oa_highlight: true}}),
    queryStringParams = {
      date: threeMonthsEarlier.toISOString(), // Minus 3 months.
      oa_highlight: false,
      id: (oaHighlights.oa_highlight && oaHighlights.oa_highlight.length ? oaHighlights.oa_highlight.map(o => o.id) : [])
    },
    response: {items: HomepageData[], collections: HomepageData[]} = await API.get('tba21', 'items/homepages', { queryStringParameters: queryStringParams });

  dispatch({
    type: LOAD_HOMEPAGE,
    items: response.items,
    collections: response.collections,
    loaded_highlights: await loadOAHighlights(oaHighlights.oa_highlight)
  });
};

const loadOAHighlights = async (data: HomepageData[]): Promise<JSX.Element[] | void> => {
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

    return data.map((e, i) => (
      <Col key={i} md={i === 0 ? '8' : '4'}>
        {!!e.file ? <FileType data={e}/> : <></>}
        <div className="title">{e.title}</div>
      </Col>
    ));
  }
};

export const loadMore = (items: [], collections: [], alreadyLoaded: JSX.Element[]) => async dispatch => {
  const
    itemRand = random(items.length >= 1 ? 1 : 0, items.length >= 5 ? 4 : items.length - 1),
    collectionRand = random(collections.length >= 1 ? 1 : 0, collections.length >= 5 ? 4 : collections.length - 1);

  const displayResults = (data: HomepageData[]) => {
    return data.map((info: HomepageData) => {
      return new Promise (async resolve => {
        const result = await getCDNObject(info.s3_key);
        if (result) {
          Object.assign(info, { file: result});
        }

        resolve(display(info));
      });
    });
  };

  const itemsResults = items.splice(0, itemRand);
  if (items.length <= 1 && itemRand > 0) {
    items = [];
  }
  const collectionsResults = collections.splice(0, collectionRand);
  if (collections.length <= 1 && collectionRand > 0) {
    collections = [];
  }

  const results = displayResults(shuffle([...itemsResults, ...collectionsResults]));

  Promise.all(results).then(res => {
    dispatch({
     type: LOAD_MORE_HOMEPAGE,
     items: items,
     collections: collections,
     loadedItems: [
       ...alreadyLoaded,
       ...res
     ]
    });
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
        <div className="embed-responsive embed-responsive-4by3">
          <ReactPlayer className="embed-responsive-item" url={props.data.file.url} width="400px" height="auto" playing={true} loop={true} vertical-align="top" />
        </div>
      );
    }
  }
  return <></>;
};

const display = async (data: HomepageData): Promise<JSX.Element> => {
  const { file } = data;
  return (
    <Col key={data.id} xs="12" md={!!file && file.type === 'audio' ? '12' : '4'}>
      {file ? <FileType data={data} /> : <></>}
      <div>{data.title}</div>
    </Col>
  );
};
