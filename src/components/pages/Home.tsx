import * as React from 'react';
import { NavLink } from 'reactstrap';
import 'styles/pages/home.scss';

const logo = require('../../images/tba_logo.png');

export const Home: React.StatelessComponent<{}> = () => {
    return (
      <div id={'home'}>
        <header>
          <img src={logo} className="logo" alt="logo" />
          <h1 className="title">Welcome to OceanArchive</h1>
        </header>
        <p className="intro">
          <NavLink href="/view">
            Open the archive
          </NavLink>
        </p>
      </div>
    );
};
