import { HomepageData } from '../../reducers/home';
import { Collection } from '../../types/Collection';
import ReactGA from 'react-ga';
import { clear as clearHistory } from 'actions/user-history';
import { collectionURL } from '../../urls';

// Defining our Actions for the reducers
export const COLLECTION_MODAL_TOGGLE = 'COLLECTION_MODAL_TOGGLE';

// Modal
export const toggle = (open: boolean, data?: HomepageData | Collection) => (dispatch, getState) => {
  if (open && data && data.id) {
    ReactGA.modalview(collectionURL(data.id));
  }

  const state = getState()
  dispatch({
     type: COLLECTION_MODAL_TOGGLE,
     open,
     data
   });

   if (!state.itemModal.open && !state.collectionModal.open) {
      dispatch(clearHistory())
   }
};
