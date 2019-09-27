import * as React from 'react';
import { Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { FaPlay } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js';
import { AudioPlayerDetails } from '../../../reducers/audioPlayer';
import { Audio } from '../../../actions/audioPlayer';

import 'styles/layout/audio.scss';

interface Props {
  data: AudioPlayerDetails;
  noClick?: boolean;
  audioPlayer: Function;
  onLoad?: Function;
}

interface State {
  paused: boolean;
  wavesurfer?: WaveSurfer;
  loaded: boolean;
}

class AudioPreview extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      paused: true,
      loaded: false,
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    this.init();
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.data.url !== prevProps.data.url) {
      this.init();
    }
  }

  init = () => {
    let loaded = this.state.loaded;
    let wavesurfer = this.state.wavesurfer;
    if (!loaded || !wavesurfer) {
      const options = {
        height: 80,
        barHeight: 20,
        // barWidth: 1,

        container: `#wavepreview_${this.props.data.id.replace(/[^\w\s]/gi, '')}`,
        backend: 'MediaElement',
        responsive: true,

        progressColor: '#4a74a5',
        waveColor: 'rgba(34, 168, 175, 19)',
        cursorColor: '#4a74a5',
        interact: false,
        hideScrollbar: true,
        forceDecode: true,
        cursorWidth: 0
      };
      wavesurfer = WaveSurfer.create(options);
    }

    if (this.props.data.url) {
      wavesurfer.load(this.props.data.url, false);
      loaded = true;
    }
    if (typeof this.props.onLoad === 'function') {
      this.props.onLoad();
    }

    this.setState( { wavesurfer: wavesurfer, loaded: loaded } );
  }

  render() {
    const { id, item_subtype, date, creators, title, url, isCollection } = this.props.data;

    return (
      <div
        className="audioPreview"
        onClick={() => {
          if (!this.props.noClick) {
            this.props.audioPlayer(true, { id, item_subtype, date, creators, title, url, isCollection });
          }
        }}
      >
        <div className="container-fluid">
          <Row className="content">
            <div className="background" />
            <div className="play">
              <FaPlay/>
            </div>
            <Col xs="6" md="4" className="info">
              <div className="type_date">
                {item_subtype ? item_subtype + ',' : ''} {date ? new Date(date).getFullYear() : <></>}
              </div>
              {creators && creators.length ?
                <div className="creator">
                  {creators[0]} {creators.length > 1 ? <em>, et al.</em> : <></>}
                </div>
                : <></>
              }
              <div className="title">{title}</div>
            </Col>
          </Row>
          <div id={`wavepreview_${id.replace(/[^\w\s]/gi, '')}`}/>
        </div>
      </div>
    );
  }
}

export default connect(undefined, { audioPlayer: Audio })(AudioPreview);
