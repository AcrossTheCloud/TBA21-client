import * as React from 'react';
import Header from './components/Header';

export const App: React.StatelessComponent<{isAuthenticated: boolean, history: any}> = (props) => { // tslint:disable-line: no-any
  return (
    <div className="container-fluid">
      <Header isAuthenticated={props.isAuthenticated} history={props.history} />
    </div>
  );
};
