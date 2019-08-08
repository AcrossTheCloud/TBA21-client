import * as React from 'react';
import ReactPlayer from 'react-player';
import { S3File } from '../../types/s3File';

import 'styles/components/multiMedia.scss';

interface MultiMediaProps {
  file: S3File;
}

export class MultiMedia extends React.Component<MultiMediaProps, {}> {

  render () {
    let element: JSX.Element;

    if (this.props.file.item_type === 'Video') {
      element = (
          <div className="embed-responsive embed-responsive-4by3">
            <ReactPlayer className="embed-responsive-item" url={this.props.file.url} width="400px" height="auto" playing={true} loop={true} vertical-align="top" />
          </div>
      );
    } else if (this.props.file.item_type === 'Image') {
      element = <img alt="" className="img-fluid" src={this.props.file.url} />;
    } else {
      element = <a href={this.props.file.url} target="_blank" rel="noopener noreferrer">link</a>;
    }

    return (
      <div className="multiMedia">
        {element}
      </div>
    );
  }

}
