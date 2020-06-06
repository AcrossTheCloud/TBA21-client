import { HomepageData } from '../../reducers/home';
import { Collection } from '../../types/Collection';
import ReactGA from 'react-ga';

// Defining our Actions for the reducers
export const COLLECTION_MODAL_TOGGLE = 'COLLECTION_MODAL_TOGGLE';

// Modal
export const toggle = (open: boolean, data?: HomepageData | Collection) => dispatch => {
  if (open && data && data.id) {
    ReactGA.modalview('/collection/'+data.id);
  }
  dispatch({
     type: COLLECTION_MODAL_TOGGLE,
     open,
     data
   });
};
