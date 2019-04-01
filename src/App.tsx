import * as React from 'react';
import Header from './components/layout/Header';

export const App = (props: any) => ( // tslint:disable-line: no-any
  <div className="container-fluid">
    <Header history={props.history} />
  </div>
);
