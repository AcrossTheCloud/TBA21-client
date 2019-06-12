import { FETCH_ITEMS } from '../../actions/items/viewItems';
import { Item } from '../../types/Item';

export interface State {
  items: Item[];
  sliderInitialized: boolean;
  sliderError: boolean;
}
const initialState: State = {
  items: [],
  sliderInitialized: false,
  sliderError: false
};

export default (state: State | null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case FETCH_ITEMS:
      return {
        ...state,
        items: action.items,
        sliderInitialized: action.sliderInitialized,
        sliderError: action.sliderError
      };

    default:
      return state;
  }

};
