import { combineReducers } from 'redux';
import ViewItems from '../reducers/items/viewItems';
import ViewItem from '../reducers/items/viewItem';
import Map from '../reducers/map/map';

const reducers = {
  viewItems: ViewItems,
  viewItem: ViewItem,

  map: Map
};

export default combineReducers(reducers);
