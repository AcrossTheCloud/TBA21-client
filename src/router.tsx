import * as React from 'react';
import { Route, Switch } from 'react-router';
import { Router, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { has } from 'lodash';

import history from './history';
import store from './store';
import Header from 'components/layout/Header';

import {
  Home,

  // START ADMIN
  ViewItem,
  EmbedItem,
  AdminManageUsers,

  // START Tables
  AdminCollections,
  AdminItems,
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
  AccountConfirmation, MapView,
  // END USER

} from './components/';


import { AuthConsumer, AuthProvider } from './providers/AuthProvider';
import SearchConsole from './components/search/SearchConsole';
import { NotFound404Message } from './components/utils/alerts';
import Announcements from './components/admin/pages/announcements/Announcements';
import { AnnouncementEditor } from './components/metadata/AnnouncementEditor';
import ViewProfile from './components/user/profile/ViewProfile';
import ViewCollection from './components/collection/ViewCollection';
import LoadingOverlay from './components/LoadingOverlay';
import PrivacyPolicyPopUp from './components/PrivacyPolicyPopUp';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/TermsAndConditions';
import RestrictiveLicence from './components/pages/RestrictiveLicence';

import ItemModal from './components/modals/ItemModal';
import CollectionModal from './components/modals/CollectionModal';
import LiveStreamModal from './components/modals/LiveStreamModal';
import About from './components/pages/About';
import { viewProfileURL, itemURL, collectionURL } from './urls';
import Story from 'components/story/Story';
import Stories from 'components/pages/Stories';

const LoggedInRoutes = ({ isAuthenticated, ...rest }) => {
  const isLoggedIn = isAuthenticated;
  return (
      <Route exact path="/Profile" render={routeProps => isLoggedIn ? <div className="main pb blue"><Profile {...history} {...routeProps} {...rest} /></div> : <Redirect to="/" />} />
  );
};

const ContributorsRoutes = ({ authorisation, ...rest }) => {
  const hasAuth = has(authorisation, 'contributor') || has(authorisation, 'editor') || has(authorisation, 'admin');
  return (
    <>
      <Route exact path="/contributor/items/add" render={routeProps => hasAuth ? <div className="main pb"><Items {...history} {...routeProps} {...rest} /></div> : <Redirect to="/" />} />
      <Route exact path="/contributor/items" render={routeProps => hasAuth ? <div className="main pb"><AdminItems {...routeProps} {...rest} /></div> : <Redirect to="/" />} />

      <Route exact path="/contributor/collections/add" render={routeProps => hasAuth ? <div className="main pb"><CollectionEditor editMode={false} {...history} {...routeProps} {...rest} /></div> : <Redirect to="/" />} />
      <Route exact path="/contributor/collections" render={routeProps => hasAuth ? <div className="main pb"><AdminCollections {...routeProps} {...rest} /></div> : <Redirect to="/" />} />

      <Route exact path="/contributor/announcements" render={() => hasAuth ? <div className="main pb"><Announcements {...rest} /></div> : <Redirect to="/" />} />
      <Route exact path="/contributor/announcements/add" render={() => hasAuth ? <div className="main pb"><AnnouncementEditor editMode={false} path={'/contributor/announcements/add'} {...rest} /></div> : <Redirect to="/" />} />
    </>
  );
};

const AdminRoutes = ({ authorisation, ...rest }) => {
  const isAdmin = has(authorisation, 'admin');
  return (
    <>
      <Route exact path="/admin/ManageUsers" render={routeProps => isAdmin ? <div className="main pb"><AdminManageUsers {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Collections" render={routeProps => isAdmin ? <div className="main pb"><AdminCollections {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/admin/Items" render={routeProps => isAdmin ? <div className="main pb"><AdminItems {...routeProps} {...rest} /></div> : <Redirect to="/"/>}/>
      <Route exact path="/admin/announcements" render={() => isAdmin ? <div className="main pb"><Announcements {...rest} /></div> : <Redirect to="/"/>}/>
    </>
  );
};

const NoMatch = ({ location }) => {
  return (location.pathname.match(/(\/admin\/|\/contributor|\/Profile)/i)) ? <></> : (<NotFound404Message pathName={location.pathname}/>);
};

export const AppRouter = () => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <AuthProvider>
          <div id="body">

            <Route
              path="/"
              render={({location}) => (
                !location.pathname.startsWith('/embed/') ?
                (<>
                  <Header />
                  <SearchConsole />
                  <PrivacyPolicyPopUp />
                  <PrivacyPolicy />
                  <TermsAndConditions />
                  <RestrictiveLicence />
                  <About />
                  <ItemModal />
                  <CollectionModal />
                  <LiveStreamModal />
                  <LoadingOverlay />
                </>) :
                (<></>)
              )}
            />

            <Switch>
              <Route exact path="/" component={Home} />
              <Route
                path={itemURL(':id')}
                render={() => (
                  <div className="main pb blue">
                    <ViewItem />
                  </div>
                )}
              />
              <Route
                path="/embed/:id"
                render={() => (
                  <div className="main pb blue">
                    <EmbedItem />
                  </div>
                )}
              />
              <Route
                path={collectionURL(':id')}
                render={() => (
                  <div className="main pb blue">
                    <ViewCollection />
                  </div>
                )}
              />
              <Route path={viewProfileURL(":profileId")} component={ViewProfile}/>
              <Route exact path="/map" component={MapView} />

              <Route exact path="/login" component={Login} />
              <Route exact path="/stories" component={Stories} />
              <Route exact path="/story/:slug" component={Story} />
              <Route exact path="/signup" component={SignUp} />
              <Route exact path="/resetPassword/" component={ResetPassword} />

              <Route exact path="/confirm/:email" component={AccountConfirmation} />

              <AuthConsumer>
                {({ isLoading }) => {
                  if (!isLoading) {
                    return <Route component={NoMatch} />;
                  } else {
                    return <></>;
                  }
                }}
              </AuthConsumer>
            </Switch>
            <AuthConsumer>
              {({ isLoading, authorisation, isAuthenticated }) => {
                if (!isLoading) {
                  return (
                    <>
                      <AdminRoutes authorisation={authorisation} history={history} />
                      <ContributorsRoutes authorisation={authorisation} history={history} />
                      <LoggedInRoutes isAuthenticated={isAuthenticated} history={history} />

                      {!isAuthenticated ? (
                          <Route
                            exact
                            path="/admin"
                            render={() => (
                              <Redirect to={'/login'} />
                            )}
                          />
                        )
                        : (
                          <Route
                            exact
                            path="/admin"
                            render={() => (
                              <Redirect to={'/admin/Items'} />
                            )}
                          />
                        )
                      }

                      {!isAuthenticated ? (
                          <Route
                            exact
                            path="/contributor"
                            render={() => (
                              <Redirect to={'/login'} />
                            )}
                          />
                        )
                        : (
                          <Route
                            exact
                            path="/contributor"
                            render={() => (
                              <Redirect to={'/contributor/items'} />
                            )}
                          />
                        )
                      }
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
