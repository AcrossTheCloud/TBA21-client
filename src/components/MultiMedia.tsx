import * as React from 'react';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';

import './MultiMedia.css';

interface MultiMediaProps {
  url: string;
}

export class MultiMedia extends React.Component<MultiMediaProps, {}> {

  render () {
    if (this.props.url.endsWith('.m3u8') || this.props.url.endsWith('.mpd') || this.props.url.includes('youtube.com')) {
      return (
        <ReactPlayer url={this.props.url} width="400px" height="auto" playing={true} loop={true} vertical-align="top" />
      );
    } else if (this.props.url.toLowerCase().endsWith('.jpg') || this.props.url.toLowerCase().endsWith('.jpeg') || this.props.url.toLowerCase().endsWith('.png')) {
      return (
        <img src={this.props.url} />
      );
    } else {
      return (
        <Link to={this.props.url} target="_blank">link</Link>
      );
    }
  }
}
