import * as React from 'react';
import WaveSurfer from 'wavesurfer.js';

interface Props {
  file: string;
}

interface State {
  file: string;
  paused: boolean;
  wavesurfer?: WaveSurfer;
}

export class AudioPlayer extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      file: props.file,
      paused: true,
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    if (!this.state.wavesurfer) {
      const
        options = {
          height: 80,
          barHeight: 20,

          container: '#wave',
          backend: 'MediaElement',
          responsive: true,

          progressColor: '#4a74a5',
          waveColor: '#cc0023',
          cursorColor: '#4a74a5'
        },
        wavesurfer = WaveSurfer.create(options);

      this.setState( { wavesurfer: wavesurfer } );

      console.log(this.state.file, 'this.state.file');

      wavesurfer.load(this.state.file);
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
