import * as React from 'react';
import { Route } from 'react-router';
import { Router, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { has } from 'lodash';

import history from './history';
import store from './store';
import { Header } from 'components/layout/Header';

import {
  Home,

  // START ADMIN
  ViewItems,
  ViewItem,
  AdminManageUsers,

  // START Tables
  AdminCollections,
  AdminItems,
  AdminPeople,
  // END Tables

  // END ADMIN

  // START Collaborator
  Items,
  CollectionEditor,
  // END Collaborator

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
import SearchConsole from './components/search/SearchConsole';

const LoggedInRoutes = ({isAuthenticated, ...rest}) => {
  const isLoggedIn = isAuthenticated;
  return (
    <>
      <Route exact path="/Profile" render={routeProps => isLoggedIn ? <Profile {...history} {...routeProps} {...rest}/> : <Redirect to="/"/>}/>
    </>
  );
};

const CollaboratorRoutes = ({authorisation, ...rest}) => {
  const hasAuth = has(authorisation, 'collaborator') || has(authorisation, 'editor') || has(authorisation, 'admin');
  return (
    <>
      <Route exact path="/contributor/items/upload" render={routeProps => hasAuth ? <Items {...history} {...routeProps} {...rest}/> : <Redirect to="/"/>}/>
      <Route exact path="/contributor/collection" render={routeProps => hasAuth ? <CollectionEditor editMode={false} {...history} {...routeProps} {...rest}/> : <Redirect to="/"/>}/>
      <Route exact path="/contributor/items" render={routeProps => hasAuth ? <AdminItems {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
    </>
  );
};

const AdminRoutes = ({authorisation, ...rest}) => {
  const isAdmin = has(authorisation, 'admin');
  return (
    <>
      <Route exact path="/admin/ManageUsers" render={routeProps => isAdmin ? <AdminManageUsers {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Collections" render={routeProps => isAdmin ? <AdminCollections {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Items" render={routeProps => isAdmin ? <AdminItems {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
      <Route exact path="/admin/People" render={routeProps => isAdmin ? <AdminPeople {...routeProps} {...rest} /> : <Redirect to="/"/>}/>
    </>
  );
};

export const AppRouter = () => {
  const currentLocation = window.location.pathname;

  return (
    <Provider store={store}>
      <Router history={history}>
        <AuthProvider>
          <div id="body" className={currentLocation === '/' ? 'fixed' : ''}>

            <Route
              path="/"
              render={() => (
                <>
                  <AuthConsumer>
                    {({isAuthenticated}) => {
                      if (isAuthenticated) {
                        return <Header />;
                      } else {
                        return  <></>;
                      }
                    }}
                  </AuthConsumer>
                  <SearchConsole />
                </>
              )}
            />

            <Route exact path="/" component={Home} />
            <div id="content">
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
                        <CollaboratorRoutes authorisation={authorisation} history={history} />
                        <LoggedInRoutes isAuthenticated={isAuthenticated} history={history} />
                      </>
                    );
                  } else {
                    return <></>;
                  }
                }}
              </AuthConsumer>
            </div>

          </div>
        </AuthProvider>
      </Router>
    </Provider>
  );
};
