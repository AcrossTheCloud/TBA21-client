import { S3File } from '../../types/s3File';
import { Col } from 'reactstrap';
import ReactPlayer from 'react-player';
import * as React from 'react';

export const FilePreview = (props: { file: S3File }): JSX.Element => {
  switch (props.file.type) {
    case 'image':
      let thumbnails: string = '';
      let background: string | undefined = undefined;
      if (props.file.thumbnails) {
        background = props.file.thumbnails['1140'] || props.file.thumbnails['960'] || props.file.thumbnails['720'] || props.file.thumbnails['540'];
        Object.entries(props.file.thumbnails).forEach( ([key, value]) => {
          thumbnails = `${thumbnails} ${value} ${key}w,`;
        } );
      }

      return (
        <Col className="px-0 image text-center h-100">
          <img
            srcSet={thumbnails}
            src={props.file.url}
            alt=""
          />
          <div className="background" style={{ background: `url(${background && background.length ? background : props.file.url})`, backgroundSize: 'contain' }} />
        </Col>
      );
    case 'video':
      const poster = !!props.file.poster ? props.file.poster : '';

      return (
        <Col className="px-0 h-100 video">
          <ReactPlayer
            controls
            url={props.file.playlist || props.file.url}
            height="100%"
            width="100%"
            vertical-align="top"
            className="player"
          />
          {!!poster ? <div className="background" style={{background: `url(${poster})`, backgroundSize: 'contain'}} /> : <></>}
        </Col>
      );
    case 'pdf':
      return (
        <div className="embed-responsive embed-responsive-4by3">
          <iframe title={props.file.url} className="embed-responsive-item" src={props.file.url} />
        </div>
      );
    default:
      return <></>;
  }
};
