import * as React from 'react';
import { FaPlay, FaPause, FaCircle, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { connect } from 'react-redux';
import WaveSurfer from 'wavesurfer.js';
import { Col, Row } from 'reactstrap';
import { Audio } from '../../../actions/audioPlayer';
import { AudioPlayerState } from '../../../reducers/audioPlayer';

import 'styles/layout/audio.scss';
import { Link } from 'react-router-dom';

interface Props extends AudioPlayerState {
  className: string;
  showTitle?: boolean;
  audioPlayer: Function;
}

interface State {
  paused: boolean;
  duration: string;
}

const audioDurationFormat = (time): string => {
  return [
    Math.floor((time % 3600) / 60), // minutes
    ('00' + Math.floor(time % 60)).slice(-2) // seconds
  ].join(':');
};

class AudioPlayer extends React.Component<Props, State> {
  _isMounted;
  wavesurfer;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      paused: true,
      duration: '00:00'
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    if (!this.wavesurfer) {
      const options = {
        height: 40,
        barHeight: 20,
        // barWidth: 1,

        container: `#audioPlayer`,
        backend: 'MediaElement',
        responsive: true,

        progressColor: '#4a74a5',
        waveColor: 'rgba(34, 168, 175, 19)',
        cursorColor: '#4a74a5',
        hideScrollbar: true,
        forceDecode: true
      };

      this.wavesurfer = WaveSurfer.create(options);
    }

    this.wavesurfer.on('waveform-ready', () => {
      this.setState({ duration: audioDurationFormat(this.wavesurfer.getDuration())});
    });

    this.wavesurfer.on('finish', () => {
      this.wavesurfer.stop();
      if (this._isMounted) {
        this.setState({ paused: true });
      }
    });

  }
  componentWillUnmount(): void {
    this.playPause(true);
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.data) {
      if (this.props.data.url !== (prevProps.data ? prevProps.data.url : false)) {

        this.wavesurfer.load(this.props.data.url);
        this.playPause(false);
      }
    }
  }

  close = () => {
    this.playPause(true);
    this.props.audioPlayer(false);
  }

  playPause = (paused: boolean) => {
    if (this._isMounted) {
      if (!paused) {
        this.wavesurfer.play();
      } else {
        this.wavesurfer.pause();
      }

      this.setState({ paused });
    }
  }

  render() {
    return (
      <div className={`audioPlayer ${this.props.open ? 'show' : 'hide'}`}>
        <div className="container-fluid">
            <Row>
              {this.props.data ?
                <>
                  <div className="control">
                    {this.state.paused ?
                      <FaPlay onClick={() => this.playPause(false)}/>
                      :
                      <FaPause onClick={() => this.playPause(true)}/>
                    }
                  </div>
                  {this.props.showTitle ?
                    <Col xs="6" md="4" className="info">
                      <div className="title">
                        {this.props.data.creators ? <>{this.props.data.creators[0]}<FaCircle/></> : <></>}
                        {this.props.data.title}
                      </div>
                    </Col>
                  : <></>}
                </>
                : <></>
              }

              <Col id="audioPlayer"/>
              <div className="duration">{this.state.duration}</div>

              <div>
                <Row>
                  {this.props.data && this.props.data.id ?
                    <Col className="openButton">
                      <Link to={`/${this.props.data.isCollection ? 'collection' : 'view'}/${this.props.data.id}`} onClick={this.close}><FaExternalLinkAlt /></Link>
                    </Col>
                    : <></>
                  }
                  <Col className="closeButton" onClick={this.close}>
                    <FaTimes />
                  </Col>
                </Row>
              </div>
            </Row>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: { audioPlayer: AudioPlayerState }) => ({ // tslint:disable-line: no-any
  open: state.audioPlayer.open,
  data: state.audioPlayer.data,
});

export default connect(mapStateToProps, { audioPlayer: Audio })(AudioPlayer);
