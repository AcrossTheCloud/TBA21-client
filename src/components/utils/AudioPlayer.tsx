import * as React from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js';

interface Props {
  url: string;
  id: string;
  date?: string;
  title?: string;
  type?: string;
}

interface State {
  id: string;
  paused: boolean;
  wavesurfer?: WaveSurfer;
  loaded: boolean;
}

export class AudioPlayer extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      id: this.props.id.replace(/[^\w\s]/gi, ''),
      paused: true,
      loaded: false,
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    if (!this.state.wavesurfer && !this.state.loaded) {
      const
        options = {
          height: 80,
          barHeight: 20,
          // barWidth: 1,

          container: `#wave_${this.state.id}`,
          backend: 'MediaElement',
          responsive: true,

          progressColor: '#4a74a5',
          waveColor: 'rgba(34, 168, 175, 19)',
          cursorColor: '#4a74a5',
          hideScrollbar: true,
          forceDecode: true
        },
        wavesurfer = WaveSurfer.create(options);

      //filter: blur(0.7px);

      wavesurfer.load(this.props.url);
      this.setState( { wavesurfer: wavesurfer, loaded: true } );
    }
  }
  componentWillUnmount(): void {
    this._isMounted = false;
    this.state.wavesurfer.pause();
  }

  playPause = (paused: boolean) => {
    if (this._isMounted) {
      if (!paused) {
        this.state.wavesurfer.play();
      } else {
        this.state.wavesurfer.pause();
      }

      this.setState({ paused });
    }
  }

  render() {
    return (
      <div className="audioplayer">
        <div className="container-fluid">
          <div className="content row">
            <div className="play">
              {this.state.paused ?
                <FaPlay onClick={() => this.playPause(false)}/>
              :
                <FaPause onClick={() => this.playPause(true)}/>
              }
            </div>
          </div>
          <div id={`wave_${this.state.id}`}/>
        </div>
      </div>
    );
  }
}
