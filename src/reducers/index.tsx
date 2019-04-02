import { combineReducers } from 'redux';
import viewItems from '../reducers/items/viewItems';
import viewItem from '../reducers/items/viewItem';

const reducers = {
  viewItems: viewItems,
  viewItem: viewItem
};

export default combineReducers(reducers);
