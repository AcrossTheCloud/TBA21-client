import * as React from 'react';
import { FaCircle, FaPlay } from 'react-icons/all';
import moment from 'moment';

import { FileTypes, S3File } from '../../types/s3File';
import { Item, itemType } from '../../types/Item';
import { HomepageData } from '../../reducers/home';

import 'styles/components/detailPreview.scss';
import { thumbnailsSRCSET } from './s3File';

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
            src="https://upload.wikimedia.org/wikipedia/commons/2/22/Unscharfe_Zeitung.jpg"
            className="image-fluid"
          />
        </picture>
      );
  }
};

export const DetailPreview = (props: { data: ItemOrHomePageData, onLoad?: Function, modalToggle?: Function}): JSX.Element => {
  if ((!!props.data.file && props.data.file.type === FileTypes.Audio) || props.data.item_type === itemType.Audio) { return <></>; }

  const { file, item_subtype, creators, title, duration, count } = props.data;
  return (
    <div className="detailPreview" onClick={() => { if (typeof props.modalToggle === 'function') { props.modalToggle(); } }}>
      {file ? <FileStaticPreview file={file} onLoad={typeof props.onLoad === 'function' ? props.onLoad : undefined}/> : <></>}
      <div className="overlay">
        <div className="type">
          {item_subtype}
        </div>

        {!!count && count > 0 ?
          <div className="count">
            {count} item{count > 1 ? 's' : ''}
          </div>
          :
          <></>
          }

        <div className="bottom">
          <div className="title-wrapper d-flex">
            {creators && creators.length ?
              <>
                <div className="creators d-none d-md-block">
                  <span className="ellipsis">{creators.join(', ')}</span>
                </div>
                <div className="d-none d-md-block">
                  <FaCircle className="dot"/>
                </div>
              </>
              : <></>
            }
            <div className="title">
              {title}
            </div>
          </div>
        </div>
        {duration ?
          <div className="duration">
            {moment.duration((typeof duration === 'string' ? parseInt(duration, 0) : duration), 'seconds').format('hh:mm:ss')}
          </div>
          : <></>}
        {file && file.type === FileTypes.Video ?
          <div className="playButton">
            <FaPlay/>
          </div>
          : <></>
        }
      </div>
    </div>
  );
};
