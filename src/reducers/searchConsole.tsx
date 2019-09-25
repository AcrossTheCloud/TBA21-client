import { SEARCH_RESULTS, CHANGE_VIEW, SEARCH_TOGGLE_OPEN, SEARCH_CONCEPT_TAGS } from 'actions/searchConsole';

import { APITag } from 'components/metadata/Tags';

export interface SearchConsoleState {
  concept_tags: APITag[];
  view: 'grid' | 'list';
  results: any[];  // tslint:disable-line: no-any
  open?: boolean;
}
const initialState: SearchConsoleState = {
  concept_tags: [],
  view: 'grid',
  results: [],
  open: false
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
        Object.assign(newState,{ concept_tags: action.concept_tags });
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
        view: 'list',
      };

    default:
      return state;
  }
};
