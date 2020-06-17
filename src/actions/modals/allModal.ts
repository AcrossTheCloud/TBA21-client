import { toggle as collectionModalToggle } from 'actions/modals/collectionModal';
import { toggle as itemModalToggle } from 'actions/modals/itemModal';

export const closeAllModal = () => (dispatch) => {
  dispatch(itemModalToggle(false))
  dispatch(collectionModalToggle(false))
}
