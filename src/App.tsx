import * as React from 'react';
import { Header } from './components/layout/Header';
import { withRouter } from 'react-router';

const TheApp = () => {
  return (
    <div className="container-fluid">
      <Header/>
    </div>
  );
};

export const App = withRouter(TheApp);
