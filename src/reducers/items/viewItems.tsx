import { FETCH_ITEMS } from '../../actions/items/viewItems';
import { OceanObject } from '../../components/pages/TableRow';

export interface State {
  items: Array<OceanObject>;
  sliderInitialized: boolean;
  sliderError: boolean;
}
const initialState: State = {
  items: [],
  sliderInitialized: false,
  sliderError: false
};

export default (state: State|null = initialState, action) => {
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
      return initialState;
  }

};
