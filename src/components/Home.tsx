import * as React from 'react';
import './Home.css';

const logo = require('./logo.svg');

export const Home: React.StatelessComponent<{}> = () => {
    return (
      <div className="Home">
        <header className="Home-header">
          <img src={logo} className="Home-logo" alt="logo" />
          <h1 className="Home-title">Welcome to React</h1>
        </header>
        <p className="Home-intro">
          To get started, edit <code>src/Home.tsx</code> and save to reload.
        </p>
      </div>
    );
};
