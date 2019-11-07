import { HomepageData } from '../../types/Home';
import { Item } from '../../types/Item';

// Defining our Actions for the reducers
export const ITEM_MODAL_TOGGLE = 'ITEM_MODAL_TOGGLE';

// Modal
export const toggle = (
  open: boolean,
  data?: HomepageData | Item
) => dispatch => {
  dispatch({
    type: ITEM_MODAL_TOGGLE,
    open,
    data
  });
};
