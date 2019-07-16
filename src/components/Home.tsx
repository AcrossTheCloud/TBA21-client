import * as React from 'react';
import { Link } from 'react-router-dom';

import 'styles/components/home.scss';

export const Home: React.StatelessComponent<{}> = () => {
  return (
    <div id="home" className="flex-fill">
      <p className="intro">
        <Link to="/view">
          Open the archive
        </Link>
      </p>
    </div>
  );
};
