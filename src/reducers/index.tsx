import { combineReducers, ReducersMapObject } from 'redux';
import viewItems from '../reducers/items/viewItems';
import viewItem from '../reducers/items/viewItem';
import viewCollection from '../reducers/collections/viewCollection';
import loadingOverlay from './loadingOverlay';
import map from '../reducers/map/map';
import home from '../reducers/home';
import userHistory from './user-history';
import profile from '../reducers/user/profile';
import manageUsers from '../reducers/admin/user/manageUsers';
import searchConsole from '../reducers/searchConsole';
import audioPlayer from '../reducers/audioPlayer';
import viewProfile from '../reducers/user/viewProfile';
import privacyPolicy from 'reducers/pages/privacyPolicy';
import about from 'reducers/pages/about';
import itemModal from 'reducers/modals/itemModal';
import collectionModal from 'reducers/modals/collectionModal';
import liveStreamModal from 'reducers/modals/liveStreamModal';

const reducers: ReducersMapObject = {
  viewItems,
  viewItem,
  viewCollection,
  viewProfile,
  userHistory,

  loadingOverlay,

  map,

  home,
  searchConsole,
  audioPlayer,
  privacyPolicy,
  about,
  itemModal,
  collectionModal,
  liveStreamModal,

  // User
  profile,

  // Admin
  manageUsers
};

export default combineReducers(reducers);
