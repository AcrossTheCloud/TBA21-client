import * as React from 'react';
import { Route } from 'react-router';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { has } from 'lodash';

import { App } from './App';
import history from './history';
import store from './store';

import {
  Home,

  // START ADMIN
  ViewItems,
  ViewItem,
  ItemEntryForm,
  ManageUsers,
  // END ADMIN

  // START USER
  Profile,
  Login,
  SignUp,
  ResetPassword,
  AccountConfirmation,
  // END USER

  PersonEntryForm,
  NetworkGraph,

  MapView
} from './components/';

import { AuthConsumer, AuthProvider } from './providers/AuthProvider';

export const AppRouter = () => {
  return (
    <AuthProvider history={history}>
      <Provider store={store}>
        <Router history={history}>
          <div>
            <Route path="/" render={(props) => <App {... {history: props.history}}/>} />

            <Route exact path="/" component={Home} />
            <Route exact path="/view" component={ViewItems} />
            <Route path="/view/:itemId" component={ViewItem} />
            <Route exact path="/map" component={MapView} />
            <Route exact path="/login" render={(props) => <Login {... {history: props.history}} />} />
            <Route exact path="/signup" render={(props) => <SignUp {... {history: props.history}} />} />
            <Route exact path="/resetPassword/" render={(props) => <ResetPassword {... {history: props.history}} />} />
            <Route exact path="/resetPassword/:confirm" render={(props) => <ResetPassword {... {history: props.history}} />} />
            <Route exact path="/viewGraph" component={NetworkGraph} />
            <Route exact path="/Profile" render={(props) => <Profile {... {history: props.history}}/>} />

            <Route exact path="/confirm/:email" component={AccountConfirmation} />

            <AuthConsumer>
              {({authorisation}) => (
                has(authorisation, 'admin') ?
                  <>
                    <Route exact path="/ManageUsers" component={ManageUsers} />
                    <Route exact path="/itemEntry" component={ItemEntryForm} />
                    <Route exact path="/PersonEntry" component={PersonEntryForm} />
                  </>
                : <></>
                )}
            </AuthConsumer>

          </div>
        </Router>
      </Provider>
    </AuthProvider>
  );
};
