import { FileTypes, S3File } from '../../types/s3File';
import { Col } from 'reactstrap';
import ReactPlayer from 'react-player';
import * as React from 'react';
import { thumbnailsSRCSET } from './s3File';

import textImage from 'images/defaults/Unscharfe_Zeitung.jpg';

export const FilePreview = (props: { file: S3File }): JSX.Element => {
  switch (props.file.type) {
    case FileTypes.Image:
      // let background: string | undefined = undefined;
      // if (props.file.thumbnails) {
      //   background = props.file.thumbnails['1140'] || props.file.thumbnails['960'] || props.file.thumbnails['720'] || props.file.thumbnails['540'];
      // }
      return (
        <Col className="px-0 image text-center">
          <img
            srcSet={thumbnailsSRCSET(props.file)}
            src={props.file.url}
            alt=""
          />
          {/*<div className="background" style={{ background: `url(${!!background ? encodeURI(background) : props.file.url})`, backgroundSize: 'contain' }} />*/}
        </Col>
      );
    case FileTypes.Video:
      const poster = !!props.file.poster ? props.file.poster : '';

      return (
        <Col className="px-0 h-100 video">
          <ReactPlayer
            controls
            url={props.file.playlist || props.file.url}
            vertical-align="top"
            className="player"
            config={{ file: { attributes: { poster: poster }} }}
          />
        </Col>
      );
    case FileTypes.Pdf:
      return (
        <div className="w-100 pdf">
          <iframe title={props.file.url} className="w-100 h-100" src={props.file.url} frameBorder={0} />
        </div>
      );

    case FileTypes.Text:
      return (
        <Col className="text">
          {props.file.body}
        </Col>
      );

    default:
      return (
        <Col className="px-0 image text-center">
          <img
            alt={''}
            src={textImage}
            className="image-fluid"
          />
        </Col>
      );
  }
};
