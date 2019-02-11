import * as React from 'react';
import { Route } from 'react-router';
import { Router } from 'react-router-dom';
import { App } from './App';
import history from './history';

import {
  Home,
  ItemEntryForm,
  PersonEntryForm,
  ArchiveTable,
  NetworkGraph,
  Login,
  SignUp,
  ResetPassword,
  MapView
} from './components';

export const AppRouter: React.StatelessComponent<{}> = () => {
  return (
    <Router history={history}>
      <div>
        <Route path="/" render={(props) => <App {... {isAuthenticated: false, history: props.history}}/>} />
        <Route exact path="/" component={Home} />
        <Route exact path="/view" component={ArchiveTable} />
        <Route exact path="/map" component={MapView} />
        <Route exact path="/login" render={(props) => <Login {... {isAuthenticated: false, history: props.history}} />} />
        <Route exact path="/signup" render={(props) => <SignUp {... {isAuthenticated: false, history: props.history}} />} />
        <Route exact path="/resetPassword" render={(props) => <ResetPassword {... {isAuthenticated: false, history: props.history}} />} />
        <Route exact path="/viewGraph" component={NetworkGraph} />
        <Route exact path="/itemEntry" component={ItemEntryForm} />
        <Route exact path="/PersonEntry" component={PersonEntryForm} />
      </div>
    </Router>
  );
};
