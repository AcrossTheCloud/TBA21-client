import * as React from 'react';
import WaveSurfer from 'wavesurfer.js';

interface Props {
  url: string;
  id: string;
}

interface State {
  url: string;
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
      url: props.url,
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
          waveColor: '#cc0023',
          cursorColor: '#4a74a5',
          hideScrollbar: true,
          forceDecode: true
        },
        wavesurfer = WaveSurfer.create(options);

      wavesurfer.load(this.state.url);
      this.setState( { wavesurfer: wavesurfer, loaded: true } );
    }
  }

  render() {
    return <div id={`wave_${this.state.id}`}/>;
  }
}
