import { combineReducers, ReducersMapObject } from 'redux';
import ViewItems from '../reducers/items/viewItems';
import ViewItem from '../reducers/items/viewItem';
import Map from '../reducers/map/map';
import Profile from '../reducers/user/profile';
import manageUsers from '../reducers/admin/user/manageUsers';

const reducers: ReducersMapObject = {
  viewItems: ViewItems,
  viewItem: ViewItem,

  map: Map,

  profile: Profile,

  // Admin
  manageUsers: manageUsers
};

export default combineReducers(reducers);
