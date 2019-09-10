import { SEARCH_RESULTS, CHANGE_VIEW, SEARCH_LOADING } from 'actions/searchConsole';

import { Tag } from '../components/metadata/Tags';

export interface SearchConsoleState {
  concept_tags: Tag[];
  selected_tags: Tag[];
  view: 'grid' | 'list';
  results: any[];  // tslint:disable-line: no-any
  loading: boolean;
}
const initialState: SearchConsoleState = {
  concept_tags: [],
  selected_tags: [],
  view: 'grid',
  results: [],
  loading: false
};

export default (state: SearchConsoleState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    case CHANGE_VIEW:
      return {
        ...state,
        view: action.view
      }
    case SEARCH_RESULTS:
      return {
        ...state,
        results: action.results,
        view: 'list',
        loading: action.loading
      }
    case SEARCH_LOADING:
      return {
        ...state,
        loading: action.loading
      }

    default:
      return state;
  }
};
