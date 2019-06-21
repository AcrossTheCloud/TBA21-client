import * as React from 'react';
import { Link } from 'react-router-dom';

import 'styles/components/home.scss';

const logo = require('images/tba_logo.png');

export const Home: React.StatelessComponent<{}> = () => {
    return (
      <div id={'home'}>
        <header>
          <img src={logo} className="logo" alt="logo" />
          <h1 className="title">Welcome to OceanArchive</h1>
        </header>
        <p className="intro">
          <Link to="/view">
            Open the archive
          </Link>
        </p>
      </div>
    );
};
