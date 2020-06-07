import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/';

const middleware = [thunk];

const composeEnhancers = (process.env.NODE_ENV === "development" && (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) )|| compose;

const store: Store = createStore(
  rootReducer,
  {},
  composeEnhancers(
    applyMiddleware(...middleware)
  )
);

export default store;
