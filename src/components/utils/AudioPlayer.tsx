import * as React from 'react';

interface Props {
  file: string;
}

interface State {
  file: string;
  player: boolean;
  location: string;
}

class AudioPlayer extends React.Component<Props, State> {
  render() {
    return (
      <audio>

      </audio>
    );
  }
}

export default AudioPlayer;
