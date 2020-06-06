import { LOAD_HOMEPAGE, LOGO_STATE_HOMEPAGE, LOAD_MORE_HOMEPAGE, MODAL_STATE_HOMEPAGE, LOAD_MORE_LOADING, LOAD_COUNT_HOMEPAGE } from 'actions/home';
import { S3File } from '../types/s3File';
import { Announcement } from '../types/Announcement';
import { Item, itemType } from '../types/Item';
import { Collection, collectionTypes } from '../types/Collection';
import { ItemOrCollection } from '../types/shared';

export interface HomepageData extends ItemOrCollection {
  file: S3File;
  id: string;
  title: string;
  s3_key: string;
  item_subtype?: string;
  item_type?: itemType;
  year_produced: string;
  end_year_produced?: string;
  time_produced: string;
  duration?: string;
  file_dimensions?: number[];
  creators?: string[];
  regions?: string[];

  // Collection specific
  count?: number;
  type?: collectionTypes | null;
  items?: Item[];
  collections?: Collection[];

  // OA Highlight specific
  concept_tags: {id: number, tag_name: string}[];
  keyword_tags: {id: number, tag_name: string}[];
}

export interface HomePageState {
  logoLoaded: boolean;
  loading: boolean;

  items: HomepageData[];
  collections: HomepageData[];
  announcements: Announcement[];
  oa_highlight: HomepageData[];

  loaded_highlights: HomepageData[];
  loadedItems: JSX.Element[];
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
  announcements: [],
  oa_highlight: [],

  loaded_highlights: [],
  loadedItems: [],
  loadedMore: false,
  loadedCount: 0,

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
        loaded_highlights: action.loaded_highlights
      };

    case LOAD_COUNT_HOMEPAGE:
      return {
        ...state,
        loadedCount: action.loadedCount,
      };

    case LOAD_MORE_HOMEPAGE:
      return {
        ...state,
        loadedCount: action.loadedCount,
        loadedItems: action.loadedItems,
        loadedMore: action.loadedMore,
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
        isModalOpen: action.isModalOpen,
      };

    default:
      return state;
  }
};
