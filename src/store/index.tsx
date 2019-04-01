import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/';

const middleware = [thunk];

const store: Store = createStore(
  rootReducer,
  {},
  compose(
    applyMiddleware(...middleware),
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()  // tslint:disable-line: no-any
  )
  );

export default store;
