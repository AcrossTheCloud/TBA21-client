import * as React from 'react';
import { Route } from 'react-router';
import { Router } from 'react-router-dom';
import { App } from './App';
import history from './history';

import { Provider } from 'react-redux';
import store from './store';

import {
  Home,

  ViewItems,
  ViewItem,
  ItemEntryForm,

  PersonEntryForm,
  NetworkGraph,
  Login,
  SignUp,
  ResetPassword,
  MapView
} from './components/';

export const AppRouter = () => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <div>
          <Route path="/" render={(props) => <App {... {isAuthenticated: false, history: props.history}}/>} />
          <Route exact path="/" component={Home} />
          <Route exact path="/view" component={ViewItems} />
          <Route path="/view/:itemId" component={ViewItem} />
          <Route exact path="/map" component={MapView} />
          <Route exact path="/login" render={(props) => <Login {... {isAuthenticated: false, history: props.history}} />} />
          <Route exact path="/signup" render={(props) => <SignUp {... {isAuthenticated: false, history: props.history}} />} />
          <Route exact path="/resetPassword" render={(props) => <ResetPassword {... {isAuthenticated: false, history: props.history}} />} />
          <Route exact path="/viewGraph" component={NetworkGraph} />
          <Route exact path="/itemEntry" component={ItemEntryForm} />
          <Route exact path="/PersonEntry" component={PersonEntryForm} />
        </div>
      </Router>
    </Provider>
  );
};
