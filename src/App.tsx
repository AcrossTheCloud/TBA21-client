import * as React from 'react';
import Header from './components/layout/Header';

import { loadFacebookSDK } from './components/utils/Facebook';

export const App: React.StatelessComponent<{history: any}> = (props) => { // tslint:disable-line: no-any

  loadFacebookSDK();

  return (
    <div className="container-fluid">
      <Header history={props.history} />
    </div>
  );
};
