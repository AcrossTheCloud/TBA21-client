import {
  LOAD_HOMEPAGE,
  LOGO_STATE_HOMEPAGE,
  LOAD_MORE_HOMEPAGE,
  MODAL_STATE_HOMEPAGE,
  LOAD_MORE_LOADING,
  LOAD_COUNT_HOMEPAGE
} from 'actions/home';
import { Announcement } from '../types/Announcement';
import { HomepageData } from '../types/Home';

export interface HomePageState {
  logoLoaded: boolean;
  loading: boolean;

  items: HomepageData[];
  collections: HomepageData[];
  audio: HomepageData[];
  announcements: Announcement[];
  oa_highlight: HomepageData[];

  highlights: HomepageData[];
  loadedItems: HomepageData[];
  loadedMore: boolean;
  loadedCount: number;

  isModalOpen: boolean;
  modalData?: HomepageData;
}

const initialState: HomePageState = {
  logoLoaded: false,
  loading: false,

  items: [],
  collections: [],
  audio: [],
  announcements: [],
  oa_highlight: [],

  highlights: [],
  loadedItems: [],
  loadedMore: false,
  loadedCount: 0,

  isModalOpen: false
};

export default (state: HomePageState | null = initialState, action) => {
  if (state === undefined) {
    state = initialState;
  }

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
        audio: action.audio,
        announcements: action.announcements,
        highlights: action.highlights
      };

    case LOAD_COUNT_HOMEPAGE:
      return {
        ...state,
        loadedCount: action.loadedCount
      };

    case LOAD_MORE_HOMEPAGE:
      return {
        ...state,
        loadedCount: action.loadedCount,
        loadedItems: action.loadedItems,
        loadedMore: action.loadedMore,
        audio: action.audio,
        items: action.items,
        collections: action.collections
      };
    case LOAD_MORE_LOADING:
      return {
        ...state,
        loading: action.loading
      };
    case MODAL_STATE_HOMEPAGE:
      return {
        ...state,
        modalData: action.modalData ? action.modalData : undefined,
        isModalOpen: action.isModalOpen
      };

    default:
      return state;
  }
};
