import { SEARCH_RESULTS, CHANGE_VIEW, SEARCH_TOGGLE_OPEN } from 'actions/searchConsole';

import { Tag } from '../components/metadata/Tags';

export interface SearchConsoleState {
  concept_tags: Tag[];
  selected_tags: Tag[];
  view: 'grid' | 'list';
  results: any[];  // tslint:disable-line: no-any
  open?: boolean;
}
const initialState: SearchConsoleState = {
  concept_tags: [],
  selected_tags: [],
  view: 'grid',
  results: [],
  open: false
};

export default (state: SearchConsoleState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    case SEARCH_TOGGLE_OPEN:
      return {
        ...state,
        open: action.open
      }
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
      }

    default:
      return state;
  }
};
