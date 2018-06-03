import * as React from 'react';
import { NavLink } from 'reactstrap';
import './Home.css';

const logo = require('../images/tba_logo.png');

export const Home: React.StatelessComponent<{}> = () => {
    return (
      <div className="Home">
        <header className="Home-header">
          <img src={logo} className="Home-logo" alt="logo" />
          <h1 className="Home-title">Welcome to OceanArchive</h1>
        </header>
        <p className="Home-intro">
          <NavLink href="/view">
            Open the archive
          </NavLink>
        </p>
      </div>
    );
};
