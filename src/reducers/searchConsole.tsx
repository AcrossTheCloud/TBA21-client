// import { LOAD_HOMEPAGE, LOGO_STATE_HOMEPAGE, LOAD_MORE_HOMEPAGE, MODAL_STATE_HOMEPAGE } from 'actions/home';

import { Tag } from '../components/metadata/Tags';
import { Item } from '../types/Item';
import { Collection } from '../types/Collection';

export interface SearchConsoleState {
  search_query: string;
  concept_tags: Tag[];
  selected_tags: Tag[];
  view: 'grid' | 'list' | 'bubble';
  results: (Item | Collection)[];
}
const initialState: SearchConsoleState = {
  search_query: '',
  concept_tags: [],
  selected_tags: [],
  view: 'bubble',
  results: []
};

export default (state: SearchConsoleState | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {

    default:
      return state;
  }
};
