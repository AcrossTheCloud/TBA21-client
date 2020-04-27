import * as React from 'react';
import { FaCircle, FaPlay } from 'react-icons/all';
import moment from 'moment';

import { FileTypes, S3File } from '../../types/s3File';
import { Item, itemType } from '../../types/Item';
import { HomepageData } from '../../reducers/home';

import 'styles/components/detailPreview.scss';
import { thumbnailsSRCSET } from './s3File';
import { Collection, collectionTypes } from '../../types/Collection';

import textImage from 'images/defaults/Unscharfe_Zeitung.jpg';
import { browser } from './browser';
import PdfPreview from './PdfPreview';
import { dateFromTimeYearProduced } from '../../actions/home';

import {ReactComponent as CollectionsInCollectionIcon} from '../../images/svgs/collections_in_collection.svg';
import {ReactComponent as CollectionIcon} from '../../images/svgs/collection.svg';

import { getCollectionsInCollection, getItemsInCollection } from '../../REST/collections';
import { removeTopology } from './removeTopology';

export type ItemOrHomePageData = Item | HomepageData;

export const checkTypeIsItem = (toBeDetermined: ItemOrHomePageData): toBeDetermined is Item => {
  // If we don't have created_at we can determine that we have a HomePageData item.
  return !!(toBeDetermined as Item).item_type && !!(toBeDetermined as Item).created_at;
};

const getOnLoadHandler = (onloadFunc) => {
  if (typeof onloadFunc === 'function') {
    // tslint:disable-next-line:no-any
    return ((event: any) => {
      onloadFunc();
    });
  } else {
    return undefined;
  }
};

export const FileStaticPreview = (props: { file: S3File, onLoad?: Function }): JSX.Element => {
  if (props.file.type === FileTypes.Audio) { return <></>; }
  switch (props.file.type) {
    case FileTypes.Image:
      return (
        <picture className="image">
          <img
            srcSet={thumbnailsSRCSET(props.file)}
            src={props.file.url}
            alt={''}
            onLoad={getOnLoadHandler(props.onLoad)}
          />
        </picture>
      );
    case FileTypes.Video:
      return (
        <picture className="videoPreview">
          <img
            onLoad={getOnLoadHandler(props.onLoad)}
            src={props.file.poster}
            alt={''}
          />
        </picture>
      );

    case FileTypes.Pdf:
      return (
        <div className="pdf">
          <PdfPreview onLoad={getOnLoadHandler(props.onLoad) || (() => {})} url={props.file.url}/>
        </div>
      );

    default:
      return (
        <picture className="image">
          <img
            onLoad={getOnLoadHandler(props.onLoad)}
            alt={''}
            src={textImage}
            className="image-fluid"
          />
        </picture>
      );
  }
};

export const getItemsAndCollectionsForCollection = async (collections) => {
  return await Promise.all(collections.map(async(collection: Collection) => {
    if (!collection.id) {
      return collection;
    }

    const collectionResponse = await getCollectionsInCollection({id: collection.id, limit: 1000, offset: 0});
    const itemResponse = await getItemsInCollection({id: collection.id, limit: 1000, offset: 0});

    return {
      ...collection,
      collections: [...removeTopology(collectionResponse, 'collection')] as Collection[],
      items: [...removeTopology(itemResponse, 'item')] as Item[]
    };
  }));
}

export const DetailPreview = (props: { data: ItemOrHomePageData, onLoad?: Function, modalToggle?: Function}): JSX.Element => {
  if ((!!props.data.file && props.data.file.type === FileTypes.Audio) || props.data.item_type === itemType.Audio) { return <></>; }

  let data: ItemOrHomePageData = props.data;
  if (Array.isArray(data.collections)) {
    getItemsAndCollectionsForCollection(data.collections).then((result) => data.collections = {
      // tslint:disable-next-line:no-any
      ...result as any
    });
  }
  let collectionType: collectionTypes | null | undefined = null;
  if (checkTypeIsItem(props.data)) {
    data = data as Item;
  } else {
    data = data as HomepageData;
    collectionType = data.type;
  }

  const date = dateFromTimeYearProduced(data.time_produced, data.year_produced);

  return (
    <div className={`detailPreview ${browser()}`} onClick={() => { if (typeof props.modalToggle === 'function') { props.modalToggle(true, props.data); } }}>
      {data.file ? <FileStaticPreview file={data.file} onLoad={typeof props.onLoad === 'function' ? props.onLoad : undefined}/> : <></>}
      <div className="overlay">
        <div className="type">
          {data.item_subtype || !!collectionType ? collectionType : ''}
        </div>

        <div className="count">
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
        </div>

        <div className="bottom">
          <div className="title-wrapper d-flex">
            {data.creators && data.creators.length ?
              <div className="creators">
                {data.creators[0]}{data.creators.length > 1 ? <em>, et al.</em> : <></>}
                <div className="d-inline-block dotwrap">
                  <FaCircle className="dot"/>
                </div>
              </div>
              : <></>
            }
            <div className="title">
              {data.title}
            </div>
          </div>
        </div>
        {data.duration ?
          <div className="duration">
            {moment.duration((typeof data.duration === 'string' ? parseInt(data.duration, 0) : data.duration), 'seconds').format('hh:mm:ss')}
          </div>
          :
          date ? <div className="date">{date}</div> : <></>
        }
        {!collectionType && data.file && data.file.type === FileTypes.Video ?
          <div className="middle">
            <FaPlay/>
          </div>
          :
          collectionType ?
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
            : <></>
        }
      </div>
    </div>
  );
};
