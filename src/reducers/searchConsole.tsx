import { SEARCH_RESULTS, CHANGE_VIEW } from 'actions/searchConsole';

import { Tag } from '../components/metadata/Tags';
import { Item } from '../types/Item';
import { Collection } from '../types/Collection';

export interface SearchConsoleState {
  concept_tags: Tag[];
  selected_tags: Tag[];
  view: 'grid' | 'list';
  results: (Item | Collection)[];
}
const initialState: SearchConsoleState = {
  concept_tags: [],
  selected_tags: [],
  view: 'grid',
  results: [],
};

export default (state: SearchConsoleState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    case CHANGE_VIEW:
      return {
        ...state,
        view: action.view,
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
