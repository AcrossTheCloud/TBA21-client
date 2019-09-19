import { combineReducers, ReducersMapObject } from 'redux';
import viewItems from '../reducers/items/viewItems';
import viewItem from '../reducers/items/viewItem';
import viewCollection from '../reducers/collections/viewCollection';
import loadingOverlay from './loadingOverlay';
import map from '../reducers/map/map';
import home from '../reducers/home';
import profile from '../reducers/user/profile';
import manageUsers from '../reducers/admin/user/manageUsers';
import searchConsole from '../reducers/searchConsole';
import audioPlayer from '../reducers/audioPlayer';
import viewProfile from '../reducers/user/viewProfile';
import privacyPolicy from 'reducers/pages/privacyPolicy';

const reducers: ReducersMapObject = {
  viewItems,
  viewItem,
  viewCollection,
  viewProfile,

  loadingOverlay,

  map,

  home,
  searchConsole,
  audioPlayer,
  privacyPolicy,

  // User
  profile,

  // Admin
  manageUsers
};

export default combineReducers(reducers);
