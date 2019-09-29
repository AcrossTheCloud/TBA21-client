import { HomepageData } from '../../reducers/home';
import { Collection } from '../../types/Collection';

// Defining our Actions for the reducers
export const COLLECTION_MODAL_TOGGLE = 'COLLECTION_MODAL_TOGGLE';

// Modal
export const toggle = (open: boolean, data?: HomepageData | Collection) => dispatch => {
  dispatch({
     type: COLLECTION_MODAL_TOGGLE,
     open,
     data
   });
};
