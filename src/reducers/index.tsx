import { combineReducers } from 'redux';
import viewItems from '../reducers/items/viewItems';

const reducers = {
  viewItems: viewItems
};

export default combineReducers(reducers);
