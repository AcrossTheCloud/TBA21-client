import { AUDIO } from 'actions/audioPlayer';

export interface AudioPlayerDetails {
  id: string;
  url: string;
  title: string;
  creators?: string[];
  item_subtype?: string;
  date: string;
  isCollection: boolean;
}
export interface AudioPlayerState {
  open: boolean;
  data?: AudioPlayerDetails;
}
const initialState: AudioPlayerState = {
  open: false,
};

export default (state: AudioPlayerState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    case AUDIO:
      const newState = {
        ...state,
        open: action.open
      };

      if (action.data) {
        Object.assign(newState, { data: action.data });
      }

      return newState;

    default:
      return state;
  }
};
