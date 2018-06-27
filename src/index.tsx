import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppRouter } from './router';

import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'mapbox-gl/dist/mapbox-gl.css';

ReactDOM.render(
  <AppRouter />, document.getElementById('root')
);
