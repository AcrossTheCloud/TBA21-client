import * as React from 'react';
import ReactPlayer from 'react-player';

import '../../styles/pages/multiMedia.scss';

interface MultiMediaProps {
  url: string;
}

export class MultiMedia extends React.Component<MultiMediaProps, {}> {

  render () {
    let element: any; // tslint:disable-line: no-any

    if (this.props.url.endsWith('.m3u8') || this.props.url.endsWith('.mpd') || this.props.url.includes('youtube.com')) {
      element = <ReactPlayer url={this.props.url} width="400px" height="auto" playing={true} loop={true} vertical-align="top" />;
    } else if (this.props.url.toLowerCase().endsWith('.jpg') || this.props.url.toLowerCase().endsWith('.jpeg') || this.props.url.toLowerCase().endsWith('.png')) {
      element = <img src={this.props.url} />;
    } else {
      element = <a href={this.props.url} target="_blank">link</a>;
    }

    return (
      <div className={'multiMedia'}>
        {element}
      </div>
    );
  }

}
