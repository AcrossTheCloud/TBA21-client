import * as React from 'react';
import { Route } from 'react-router';
import { Router, Redirect } from 'react-router-dom';
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
  ManageUsers,

  // START Tables
  Collections,
  Items,
  People,
  // END Tables

  // END ADMIN

  // START USER
  Profile,
  Login,
  SignUp,
  ResetPassword,
  AccountConfirmation,
  // END USER

  NetworkGraph,

  MapView
} from './components/';

import { AuthConsumer, AuthProvider } from './providers/AuthProvider';

const LoggedInRoutes = ({isAuthenticated, ...rest}) => {
  const isLoggedIn = isAuthenticated;
  return (
    <>
      <Route exact path="/Profile" render={routeProps => isLoggedIn ? <Profile {... {history: routeProps.history}} {...rest}/> : <Redirect to="/"/>}/>
    </>
  );
};

const AdminRoutes = ({authorisation, ...rest}) => {
  const isAdmin = has(authorisation, 'admin');
  return (
    <>
      <Route exact path="/admin/ManageUsers" render={routeProps => isAdmin ? <ManageUsers {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Collections" render={routeProps => isAdmin ? <Collections {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Items" render={routeProps => isAdmin ? <Items {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
      <Route exact path="/admin/People" render={routeProps => isAdmin ? <People {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
    </>
  );
};

export const AppRouter = () => {
  return (
    <AuthProvider history={history}>
      <Provider store={store}>
        <Router history={history}>
          <div>
            <Route path="/" render={() => <App />} />

            <Route exact path="/" component={Home} />
            <Route exact path="/view" component={ViewItems} />
            <Route path="/view/:itemId" component={ViewItem} />
            <Route exact path="/map" component={MapView} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/resetPassword/" component={ResetPassword} />
            <Route exact path="/viewGraph" component={NetworkGraph} />

            <Route exact path="/confirm/:email" component={AccountConfirmation} />

            <AuthConsumer>
              {({isLoading, authorisation, isAuthenticated}) => {
                if (!isLoading) {
                  return (
                    <>
                      <AdminRoutes authorisation={authorisation} history={history} />
                      <LoggedInRoutes isAuthenticated={isAuthenticated} history={history} />
                    </>
                  );
                } else {
                  return <></>;
                }
              }}
            </AuthConsumer>

          </div>
        </Router>
      </Provider>
    </AuthProvider>
  );
};
