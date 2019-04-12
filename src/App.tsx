import * as React from 'react';
import Header from './components/layout/Header';

export const App = (props) => {
  return (
    <div className="container-fluid">
      <Header history={props.history} />
    </div>
  );
};
