import { LOAD_HOMEPAGE, LOGO_STATE_HOMEPAGE, LOAD_MORE_HOMEPAGE } from 'actions/home';
import { S3File } from '../types/s3File';

export interface HomepageData {
  count?: string;
  file?: S3File;
  id: string;
  title: string;
  s3_key: string;
  type: string;
}

export interface HomePageState {
  logoLoaded: boolean;

  items: HomepageData[];
  collections: HomepageData[];
  oa_highlight: HomepageData[];

  loaded_highlights: JSX.Element[][];
  loadedItems: JSX.Element[];
}
const initialState: HomePageState = {
  logoLoaded: false,

  items: [],
  collections: [],
  oa_highlight: [],

  loaded_highlights: [],
  loadedItems: []
};

export default (state: HomePageState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case LOGO_STATE_HOMEPAGE:
      return {
        ...state,
        logoLoaded: action.logoLoaded
      };
    case LOAD_HOMEPAGE:
      return {
        ...state,
        items: action.items,
        collections: action.collections,
        loaded_highlights: action.loaded_highlights
      };
    case LOAD_MORE_HOMEPAGE:
      return {
        ...state,
        loadedItems: action.loadedItems,
        items: action.items,
        collections: action.collections,
      };

    default:
      return state;
  }
};
