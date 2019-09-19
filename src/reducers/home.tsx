import { LOAD_HOMEPAGE, LOGO_STATE_HOMEPAGE, LOAD_MORE_HOMEPAGE, MODAL_STATE_HOMEPAGE } from 'actions/home';
import { FileTypes, S3File } from '../types/s3File';
import { Announcement } from '../types/Announcement';

export interface HomepageData {
  file: S3File;
  id: string;
  title: string;
  s3_key: string;
  item_subtype?: string;
  item_type?: FileTypes | null;
  date: string;
  duration?: string;
  file_dimensions?: number[];
  creators?: string[];
  regions?: string[];

  // Collection specific
  count?: string;
  type?: FileTypes | null;
  items?: HomepageData[];

  // OA Highlight specific
  concept_tags: {id: number, tag_name: string}[];
  keyword_tags: {id: number, tag_name: string}[];
}

export interface HomePageState {
  logoLoaded: boolean;

  items: HomepageData[];
  collections: HomepageData[];
  audio: HomepageData[];
  announcements: Announcement[];
  oa_highlight: HomepageData[];

  loaded_highlights: HomepageData[];
  loadedItems: HomepageData[];
  loadedMore: boolean;

  isModalOpen: boolean;
  modalData?: HomepageData;
}
const initialState: HomePageState = {
  logoLoaded: false,

  items: [],
  collections: [],
  audio: [],
  announcements: [],
  oa_highlight: [],

  loaded_highlights: [],
  loadedItems: [],
  loadedMore: false,

  isModalOpen: false,
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
        announcements: action.announcements,
        loaded_highlights: action.loaded_highlights,
      };
    case LOAD_MORE_HOMEPAGE:
      return {
        ...state,
        loadedItems: action.loadedItems,
        loadedMore: action.loadedMore,
        audio: action.audio,
        items: action.items,
        collections: action.collections
      };
    case MODAL_STATE_HOMEPAGE:
      return {
        ...state,
        modalData: action.modalData ? action.modalData : undefined,
        isModalOpen: action.isModalOpen,
      };

    default:
      return state;
  }
};
