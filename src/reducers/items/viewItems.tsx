import { FETCH_ITEMS, FETCH_MORE_ITEMS } from '../../actions/items/viewItems';
import { Item } from '../../types/Item';
import { Alerts } from '../../components/utils/alerts';

export interface State extends Alerts {
  items: {
    [id: number]: Item
  };
}
const initialState: State = {
  items: {}
};

export default (state: State | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case FETCH_ITEMS:
      return {
        ...state,
        items: action.items,
      };

    case FETCH_MORE_ITEMS:
      const stateItems = state && state.items ? state.items : {};
      return {
        ...state,
        items: {...stateItems, ...action.items},
      };

    default:
      return state;
  }

};
