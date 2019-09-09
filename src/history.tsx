// history.js
import { createBrowserHistory } from '../node_modules/history';
import ReactGA from 'react-ga';

import config from './config';

ReactGA.initialize(config.google.UA_ID);

const history = createBrowserHistory();

const historyListener = (location) => {
  ReactGA.set({ page: location.pathname });
	ReactGA.pageview(location.pathname);
}

history.listen(historyListener);
historyListener(window.location);

export default history;
