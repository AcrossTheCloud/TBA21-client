import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/';

const middleware = [thunk];

const store: Store = createStore(
  rootReducer,
  {},
  compose(
    applyMiddleware(...middleware)
  )
);

export default store;
