import React, { Component } from 'react';
import $ from 'jquery';

import 'styles/layout/logo.scss';
import logo from 'images/logo/oa_web_white.svg';

interface Props {
  onChange: Function;
  loaded: boolean;
}

interface State {
  loaded: boolean;
}

export default class Logo extends Component<Props, State> {
  _isMounted;
  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      loaded: this.props.loaded || false
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    if (!this.props.loaded) {
      setTimeout(() => {
        $('#logo .right').addClass('op');
      }, 750);

      setTimeout(() => {
        $('#logo .left, #logo .right').addClass('init');
      }, 2750);

      setTimeout(() => {
        $('#body').removeClass('fixed').addClass('logoLoaded');
        if (!this._isMounted) { return; }
        this.setState({ loaded: true });
      }, 4750);

      setTimeout(() => {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
          this.props.onChange();
        }
      }, 5750);
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  render() {
    const { loaded } = this.state;

    return (
      <div id="logo" className={loaded ? 'loaded' : ''}>
        <header>
          <div className={`left show ${loaded ? 'init' : ''}`}>
            <img src={logo} alt="Ocean Archive" />
          </div>

          <div className={`right show op ${loaded ? 'init' : ''}`}>
            <img src={logo} alt="Ocean Archive" />
          </div>
        </header>
      </div>
    );
  }
}
