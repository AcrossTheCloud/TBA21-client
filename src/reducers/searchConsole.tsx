import {
  SEARCH_RESULTS,
  CHANGE_VIEW,
  SEARCH_TOGGLE_OPEN,
  SEARCH_CONCEPT_TAGS,
  SEARCH_RESULTS_LOADING,
  CriteriaOption
} from 'actions/searchConsole';

import { APITag } from 'components/metadata/Tags';
import { Item } from '../types/Item';
import { Collection } from '../types/Collection';
import { Profile } from '../types/Profile';

export type ItemOrCollectionOrProfile = Item | Collection | Profile;

export interface SearchConsoleState {
  concept_tags: APITag[];
  view: 'grid' | 'list';
  results: ItemOrCollectionOrProfile[];
  loadedResults: ItemOrCollectionOrProfile[];
  searchResultsLoading: boolean;
  offset: number;
  open: boolean;
  selectedCriteria: CriteriaOption[];
}
const initialState: SearchConsoleState = {
  concept_tags: [],
  view: 'grid',
  results: [],
  loadedResults: [],
  searchResultsLoading: false,
  offset: 0,
  open: false,
  selectedCriteria: []
};

export default (state: SearchConsoleState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    case SEARCH_TOGGLE_OPEN:
      const newState = {
        ...state,
        open: action.open
      };

      if (action.concept_tags) {
        Object.assign(newState, { concept_tags: action.concept_tags });
      }
      return newState;

    case SEARCH_CONCEPT_TAGS:
      return {
        ...state,
        concept_tags: action.concept_tags
      };

    case CHANGE_VIEW:
      return {
        ...state,
        view: action.view
      };

    case SEARCH_RESULTS:
      return {
        ...state,
        results: action.results,
        loadedResults: action.loadedResults,
        offset: action.offset,
        searchResultsLoading: false,
        view: 'list',
        selectedCriteria: action.selectedCriteria
      };

    case SEARCH_RESULTS_LOADING:
      return {
        ...state,
        searchResultsLoading: action.loading
      };

    default:
      return state;
  }
};
