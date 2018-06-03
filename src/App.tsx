import * as React from 'react';
import Header from './components/Header';

export const App: React.StatelessComponent<{}> = (props) => {
  return (
    <div className="container-fluid">
      <Header />
      {props.children}
    </div>

  );
};
