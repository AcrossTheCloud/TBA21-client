import { combineReducers } from 'redux';
import ViewItems from '../reducers/items/viewItems';
import ViewItem from '../reducers/items/viewItem';
import Map from '../reducers/map/map';
import Profile from '../reducers/user/profile';

const reducers = {
  viewItems: ViewItems,
  viewItem: ViewItem,

  map: Map,

  profile: Profile
};

export default combineReducers(reducers);
