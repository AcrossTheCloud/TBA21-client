import { combineReducers, ReducersMapObject } from 'redux';
import ViewItems from '../reducers/items/viewItems';
import ViewItem from '../reducers/items/viewItem';
import ViewCollection from '../reducers/collections/viewCollection';
import LoadingOverlay from './loadingOverlay';
import Map from '../reducers/map/map';
import Home from '../reducers/home';
import Profile from '../reducers/user/profile';
import manageUsers from '../reducers/admin/user/manageUsers';
import searchConsole from '../reducers/searchConsole';
import audioPlayer from '../reducers/audioPlayer';
import ViewProfile from '../reducers/user/viewProfile';

const reducers: ReducersMapObject = {
  viewItems: ViewItems,
  viewItem: ViewItem,
  viewCollection: ViewCollection,
  viewProfile: ViewProfile,

  loadingOverlay: LoadingOverlay,

  map: Map,

  home: Home,

  profile: Profile,

  // Admin
  manageUsers: manageUsers,

  searchConsole: searchConsole,

  audioPlayer: audioPlayer
};

export default combineReducers(reducers);
