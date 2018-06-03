import * as React from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Home, EntryForm } from './components';

export const AppRouter: React.StatelessComponent<{}> = () => {
  return (
    <BrowserRouter>
      <div>
        <Route path="/" component={App} />
        <Route exact path="/" component={Home} />
        <Route exact path="/entry" component={EntryForm} />
      </div>
    </BrowserRouter>
  );
};
