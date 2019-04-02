import { FETCH_ITEM, FETCH_ITEM_ERROR } from '../../actions/items/viewItem';
import { OceanObject } from '../../components/pages/TableRow';

export interface State {
  itemId?: string | boolean;
  hasError: boolean;
  itemInformation?: OceanObject;
}
const initialState: State = {
  hasError: false
};

export default (state: State|null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case FETCH_ITEM:
      return {
        ...state,
        itemInformation: action.itemInformation,
      };
    case FETCH_ITEM_ERROR:
      return {
        ...state,
        hasError: true,
      };

    default:
      return initialState;
  }

};
