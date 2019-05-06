import * as React from 'react';
import { Redirect, Route, RouteProps } from 'react-router';
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
  // END USER

  PersonEntryForm,
  NetworkGraph,

  MapView
} from './components/';

import { AuthConsumer, AuthProvider } from './providers/AuthProvider';

/**
 *
 * Checks auth and returns the Component or Redirects to / if the User is not an Admin
 *
 * @param Component {React.Component}
 * @param otherProps All other props provided
 * @returns A Route of Component or Redirect
 */
const AdminRoute: React.FunctionComponent<RouteProps> = ({ component: Component, ...otherProps }: { component: React.ComponentType<RouteProps>; }) => {
  return (
    <AuthConsumer>
      {({ authorisation }) => (
        <Route {...otherProps} render={props => has(authorisation, 'admin') ? <Component {...props} /> : <Redirect to="/" />} />
      )}
    </AuthConsumer>
  );
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
            <Route exact path="/login" render={(props) => <Login {... {history: props.history}} />} />
            <Route exact path="/signup" render={(props) => <SignUp {... {history: props.history}} />} />
            <Route exact path="/resetPassword" render={(props) => <ResetPassword {... {history: props.history}} />} />
            <Route exact path="/viewGraph" component={NetworkGraph} />
            <Route exact path="/Profile" render={(props) => <Profile {... {history: props.history}}/>} />

            <AdminRoute exact path="/ManageUsers" component={ManageUsers}/>
            <AdminRoute exact path="/itemEntry" component={ItemEntryForm} />
            <AdminRoute exact path="/PersonEntry" component={PersonEntryForm} />
          </div>
        </Router>
      </Provider>
    </AuthProvider>
  );
};
