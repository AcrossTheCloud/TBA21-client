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
import { AuthorisationList } from './components/utils/Auth';

const isLoggedIn = (isAuthenticated: boolean ): JSX.Element => {
  if (!isAuthenticated) {
    return (
      <>
        <Route exact path="/login" render={(propse) => <Login {... {history: propse.history}} />} />
        <Route exact path="/signup" render={(propse) => { return <SignUp {... {history: propse.history}} />; }} />
      </>
    );
  } else {
    return <Route exact path="/Profile" render={(propse) => <Profile {... {history: propse.history}}/>} />;
  }
};

const isAdmin = (authorisation: AuthorisationList): JSX.Element => {
  if (has(authorisation, 'admin')) {
    return (
      <>
        <Route exact path="/ManageUsers" component={ManageUsers} />
        <Route exact path="/itemEntry" component={ItemEntryForm} />
        <Route exact path="/PersonEntry" component={PersonEntryForm} />
      </>
    );
  } else {
    return <></>;
  }
};

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

            <Route exact path="/resetPassword/" render={(props) => <ResetPassword {... {history: props.history}} />} />
            <Route exact path="/resetPassword/:confirm" render={(props) => <ResetPassword {... {history: props.history}} />} />
            <Route exact path="/viewGraph" component={NetworkGraph} />

            <Route exact path="/confirm/:email" component={AccountConfirmation} />

            <AuthConsumer>
              {({authorisation, isAuthenticated}) => (
                <>
                  {isAdmin(authorisation)}
                  {isLoggedIn(isAuthenticated)}
                </>
              )}
            </AuthConsumer>

          </div>
        </Router>
      </Provider>
    </AuthProvider>
  );
};
