import { combineReducers, ReducersMapObject } from 'redux';
import ViewItems from '../reducers/items/viewItems';
import ViewItem from '../reducers/items/viewItem';
import Map from '../reducers/map/map';
import Home from '../reducers/home';
import Profile from '../reducers/user/profile';
import manageUsers from '../reducers/admin/user/manageUsers';
import searchConsole from '../reducers/searchConsole';

const reducers: ReducersMapObject = {
  viewItems: ViewItems,
  viewItem: ViewItem,

  map: Map,

  home: Home,

  profile: Profile,

  // Admin
  manageUsers: manageUsers,

  searchConsole: searchConsole
};

export default combineReducers(reducers);
