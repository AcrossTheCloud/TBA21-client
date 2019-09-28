import * as React from 'react';
import { FaCircle, FaPlay } from 'react-icons/all';
import moment from 'moment';

import { FileTypes, S3File } from '../../types/s3File';
import { Item, itemType } from '../../types/Item';
import { HomepageData } from '../../reducers/home';

import 'styles/components/detailPreview.scss';
import { thumbnailsSRCSET } from './s3File';
import { collectionTypes } from '../../types/Collection';

import textImage from 'images/defaults/Unscharfe_Zeitung.jpg';
import { browser } from './browser';

export type ItemOrHomePageData = Item | HomepageData;

export const checkTypeIsItem = (toBeDetermined: ItemOrHomePageData): toBeDetermined is Item => {
  // If we don't have created_at we can determine that we have a HomePageData item.
  return !!(toBeDetermined as Item).item_type && !!(toBeDetermined as Item).created_at;
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
            onLoad={typeof props.onLoad === 'function' ? props.onLoad() : () => { return; }}
          />
        </picture>
      );
    case FileTypes.Video:
      return (
        <picture className="videoPreview">
          <img
            onLoad={typeof props.onLoad === 'function' ? props.onLoad() : () => { return; }}
            src={props.file.poster}
            alt={''}
          />
        </picture>
      );

    default:
      return (
        <picture className="image">
          <img
            onLoad={typeof props.onLoad === 'function' ? props.onLoad() : () => { return; }}
            alt={''}
            src={textImage}
            className="image-fluid"
          />
        </picture>
      );
  }
};

export const DetailPreview = (props: { data: ItemOrHomePageData, onLoad?: Function, modalToggle?: Function}): JSX.Element => {
  if ((!!props.data.file && props.data.file.type === FileTypes.Audio) || props.data.item_type === itemType.Audio) { return <></>; }

  let data: ItemOrHomePageData = props.data;
  let collectionType: collectionTypes | null | undefined = null;
  if (checkTypeIsItem(props.data)) {
    data = data as Item;
  } else {
    data = data as HomepageData;
    collectionType = data.type;
  }

  return (
    <div className={`detailPreview ${browser()}`} onClick={() => { if (typeof props.modalToggle === 'function') { props.modalToggle(); } }}>
      {data.file ? <FileStaticPreview file={data.file} onLoad={typeof props.onLoad === 'function' ? props.onLoad : undefined}/> : <></>}
      <div className="overlay">
        <div className="type">
          {data.item_subtype || !!collectionType ? collectionType : ''}
        </div>

        {
          !!data.count && data.count > 0 ?
            <div className="count">
              {data.count} item{data.count > 1 ? 's' : ''}
            </div>
            :
            <></>
        }

        <div className="bottom">
          <div className="title-wrapper d-flex">
            {data.creators && data.creators.length ?
              <>
                <div className="creators">
                  {data.creators[0]}{data.creators.length > 1 ? <em>, et al.</em> : <></>}
                </div>
                <div className="d-none d-md-block dotwrap">
                  <FaCircle className="dot"/>
                </div>
              </>
              : <></>
            }
            <div className="title">
              <span className="ellipsis">{data.title}</span>
            </div>
          </div>
        </div>
        {data.duration ?
          <div className="duration">
            {moment.duration((typeof data.duration === 'string' ? parseInt(data.duration, 0) : data.duration), 'seconds').format('hh:mm:ss')}
          </div>
          : <></>}
        {!collectionType && data.file && data.file.type === FileTypes.Video ?
          <div className="middle">
            <FaPlay/>
          </div>
          :
          collectionType ?
            <div className="middle">
              <svg className="collection_icon" viewBox="0 0 7 31" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <g stroke="none" strokeWidth="1" fill="#fff">
                  <rect id="Rectangle" x="3" y="6" width="1" height="19" />
                  <circle id="Oval" cx="3.5" cy="3.5" r="3.5"/>
                  <circle id="Oval-Copy-2" cx="3.5" cy="15.5" r="2.5"/>
                  <circle id="Oval-Copy" cx="3.5" cy="27.5" r="3.5"/>
                </g>
              </svg>
            </div>
            : <></>
        }
      </div>
    </div>
  );
};
