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
  ViewItem,
  AdminManageUsers,

  // START Tables
  AdminCollections,
  AdminItems,
  AdminPeople,
  // END Tables

  // END ADMIN

  // START Contributors
  Items,
  CollectionEditor,
  // END Contributors

  // START USER
  Profile,
  Login,
  SignUp,
  ResetPassword,
  AccountConfirmation,
  // END USER

} from './components/';

import { AuthConsumer, AuthProvider } from './providers/AuthProvider';
import SearchConsole from './components/search/SearchConsole';
import Announcements from './components/admin/pages/announcements/Announcements';
import { AnnouncementEditor } from './components/metadata/AnnouncementEditor';
import ViewProfile from './components/user/profile/ViewProfile';
import ViewCollection from './components/collection/ViewCollection';
import LoadingOverlay from './components/LoadingOverlay';

const LoggedInRoutes = ({isAuthenticated, ...rest}) => {
  const isLoggedIn = isAuthenticated;
  return (
    <>
      <Route exact path="/Profile" render={routeProps => isLoggedIn ? <div className="main"><Profile {...history} {...routeProps} {...rest}/></div> : <Redirect to="/"/>}/>
    </>
  );
};

const ContributorsRoutes = ({authorisation, ...rest}) => {
  const hasAuth = has(authorisation, 'contributor') || has(authorisation, 'editor') || has(authorisation, 'admin');
  return (
    <>
      <Route exact path="/contributor/items/add" render={routeProps => hasAuth ? <div className="main"><Items {...history} {...routeProps} {...rest}/></div> : <Redirect to="/"/>}/>
      <Route exact path="/contributor/items" render={routeProps => hasAuth ? <div className="main"><AdminItems {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>

      <Route exact path="/contributor/collections/add" render={routeProps => hasAuth ? <div className="main"><CollectionEditor editMode={false} {...history} {...routeProps} {...rest}/></div> : <Redirect to="/"/>}/>
      <Route exact path="/contributor/collections" render={routeProps => hasAuth ? <div className="main"><AdminCollections {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>

      <Route exact path="/contributor/announcements" render={() => hasAuth ? <div className="main"><Announcements {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/contributor/announcements/add" render={() => hasAuth ? <div className="main"><AnnouncementEditor editMode={false} path={'/contributor/announcements/add'} {...rest} /></div> : <Redirect to="/"/>}/>
    </>
  );
};

const AdminRoutes = ({authorisation, ...rest}) => {
  const isAdmin = has(authorisation, 'admin');
  return (
    <>
      <Route exact path="/admin/ManageUsers" render={routeProps => isAdmin ? <div className="main"><AdminManageUsers {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Collections" render={routeProps => isAdmin ? <div className="main"><AdminCollections {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Items" render={routeProps => isAdmin ? <div className="main"><AdminItems {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/admin/People" render={routeProps => isAdmin ? <div className="main"><AdminPeople {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/admin/announcements" render={() => isAdmin ? <div className="main"><Announcements {...rest} /></div> : <Redirect to="/"/>}/>
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
                  <LoadingOverlay />
                </>
              )}
            />

            <Route exact path="/" component={Home} />
            <Route
              path="/view/:itemId"
              render={() => (
                <div className="container-fluid main blue">
                  <ViewItem />
                </div> )
              }
            />
            <Route
              path="/collection/:itemId"
              render={() => (
                <div className="container-fluid main blue">
                  <ViewCollection />
                </div> )
              }
            />
            <Route
              path="/profiles/:profileId"
              render={() => (
                <div className="container-fluid main blue">
                  <ViewProfile />
                </div> )
              }
            />
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/resetPassword/" component={ResetPassword} />

            <Route exact path="/confirm/:email" component={AccountConfirmation} />

            <AuthConsumer>
              {({isLoading, authorisation, isAuthenticated}) => {
                if (!isLoading) {
                  return (
                    <>
                      <AdminRoutes authorisation={authorisation} history={history} />
                      <ContributorsRoutes authorisation={authorisation} history={history} />
                      <LoggedInRoutes isAuthenticated={isAuthenticated} history={history} />
                    </>
                  );
                } else {
                  return <></>;
                }
              }}
            </AuthConsumer>
          </div>
        </AuthProvider>
      </Router>
    </Provider>
  );
};
