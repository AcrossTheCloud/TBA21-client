// Defining our Actions for the reducers.

import { AudioPlayerDetails } from '../reducers/audioPlayer';

export const AUDIO = 'AUDIO';

export const Audio = (open: boolean, data?: AudioPlayerDetails) => dispatch => {
  const state = {
    type: AUDIO,
    open
  };

  if (data) {
    Object.assign(state, {data});
  }

  dispatch(state);
};
