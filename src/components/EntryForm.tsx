import * as React from 'react';
import './EntryForm.css';

const logo = require('./logo.svg');

export const EntryForm: React.StatelessComponent<{}> = () => {
    return (
      <div className="EntryForm">
        <header className="EntryForm-header">
          <img src={logo} className="EntryForm-logo" alt="logo" />
          <h1 className="EntryForm-title">Welcome to React</h1>
        </header>
        <p className="EntryForm-intro">
          To get started, edit <code>src/EntryForm.tsx</code> and save to reload.
        </p>
      </div>
    );
};
