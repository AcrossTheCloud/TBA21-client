import * as React from 'react';
import Header from './components/layout/Header';

export const App: React.StatelessComponent<{history: any}> = (props) => { // tslint:disable-line: no-any
  return (
    <div className="container-fluid">
      <Header history={props.history} />
    </div>
  );
};
