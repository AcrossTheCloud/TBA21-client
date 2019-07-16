import * as React from 'react';
import WaveSurfer from 'wavesurfer.js';

interface Props {
  file: string;
}

interface State {
  file: string;
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
      file: props.file,
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

          container: '#wave',
          backend: 'MediaElement',
          responsive: true,

          progressColor: '#4a74a5',
          waveColor: '#cc0023',
          cursorColor: '#4a74a5',
          hideScrollbar: true,
          forceDecode: true
        },
        wavesurfer = WaveSurfer.create(options);

      wavesurfer.load(this.state.file);
      this.setState( { wavesurfer: wavesurfer, loaded: true } );
    }
  }

  render() {
    return (
      <>
        <div id="wave"/>
      </>
    );
  }
}
