import * as React from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Home, EntryForm } from './components';

export const AppRouter: React.StatelessComponent<{}> = () => {
  return (
    <BrowserRouter>
      <Route path="/" component={App} >
        <Route exact path="/" component={Home} />
        <Route path="/entry" component={EntryForm} />
      </Route>
    </BrowserRouter>
  );
};
