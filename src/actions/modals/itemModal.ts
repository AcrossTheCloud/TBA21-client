import { HomepageData } from '../../reducers/home';
import { Item } from '../../types/Item';
import { clear as clearHistory } from 'actions/user-history';
import ReactGA from 'react-ga';
import { itemURL } from 'urls';
// Defining our Actions for the reducers
export const ITEM_MODAL_TOGGLE = 'ITEM_MODAL_TOGGLE';
// Modal
export const toggle = (open: boolean, data?: HomepageData | Item) => (dispatch, getState) => {
  if (open && data && data.id) {
    ReactGA.modalview(itemURL(data.id));
  }
  const state = getState()
  dispatch({
     type: ITEM_MODAL_TOGGLE,
     open,
     data
   });

   if (!state.itemModal.open && !state.collectionModal.open) {
    dispatch(clearHistory())
 }
};
