import { FileTypes, S3File } from '../../types/s3File';
import { Col } from 'reactstrap';
import ReactPlayer from 'react-player';
import * as React from 'react';
import { thumbnailsSRCSET } from './s3File';

import textImage from 'images/defaults/Unscharfe_Zeitung.jpg';
import PdfPreview from './PdfPreview';
import { ReactComponent as DownloadIcon } from 'images/svgs/download.svg';

export const FilePreview = (props: { file: S3File , isHeader?: boolean}): JSX.Element => {
  switch (props.file.type) {
    case FileTypes.Image:
      // let background: string | undefined = undefined;
      // if (props.file.thumbnails) {
      //   background = props.file.thumbnails['1140'] || props.file.thumbnails['960'] || props.file.thumbnails['720'] || props.file.thumbnails['540'];
      // }
      return (
        <Col className={props.isHeader? 'px-0 image' : 'px-0 image text-center'} style={props.isHeader?{maxHeight:"35vh", left: "-5px"}:{}}>
          <img
            srcSet={thumbnailsSRCSET(props.file)}
            src={props.file.url}
            alt=""
            style={props.isHeader? {width:"auto !important", height:"100%", paddingLeft: "2%"}:{}}
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
            style={props.isHeader? {paddingLeft: "2%"} : {}}
            config={{ file: { attributes: { poster: poster }} }}
          />
        </Col>
      );
    case FileTypes.Pdf:
      return (
        <a href={props.file.url} target="_blank" style={{width: '100%', height: '100%', display: "block"}}>
          <div className="relative w-100 pdf flex items-start justify-center">
          <PdfPreview url={props.file.url} onLoad={() => {}} />
          <div className="overlay"></div>
          <div className="absolute absolute-center">
            <DownloadIcon />
          </div>
        </div>
        </a>
      );

    case FileTypes.Text:
      return (
        <Col className="text">
          {props.file.body}
        </Col>
      );

    case FileTypes.DownloadText:
      return (
        <Col className="px-0 image text-center">
          <a href={props.file.url} target="_blank" rel="noopener noreferrer">
            <img alt="" src={textImage} className="image-fluid"/>
          </a>
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
