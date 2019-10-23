import { HomepageData } from '../../types/Home';
import { COLLECTION_MODAL_TOGGLE } from '../../actions/modals/collectionModal';
import { ITEM_MODAL_TOGGLE } from '../../actions/modals/itemModal';

export const openModal = (data: HomepageData) => dispatch => {
  if (
    data.hasOwnProperty('count') ||
    data.hasOwnProperty('items') ||
    data.hasOwnProperty('type')
  ) {
    // We have a collection.
    dispatch({
      type: COLLECTION_MODAL_TOGGLE,
      open: true,
      data
    });
  } else {
    dispatch({
      type: ITEM_MODAL_TOGGLE,
      open: true,
      data
    });
  }
};
