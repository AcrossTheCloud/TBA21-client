import React, { Component } from 'react';
import $ from 'jquery';

import 'styles/layout/logo.scss';
import logo from 'images/logo/oa_web_white.svg';

interface Props {
  onChange?: Function;
  loaded: boolean;
}

interface State {
  // We keep the final loaded prop in state, this is so we can set the class on the #logo div
  finallyLoaded: boolean;
}

export default class Logo extends Component<Props, State> {
  _isMounted;
  detectScroll;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      finallyLoaded: false
    };

    this.detectScroll = () => {
      const $main = $('#main');
      if (window.scrollY > $main!.offset()!.top - 43) {
      // if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        $('#logo').addClass('inv');
      } else {
        $('#logo').removeClass('inv');
      }
    };
  }

  componentDidMount(): void {
    this._isMounted = true;

    // If the logo hasn't loaded ever add this class to Body
    if (!this.props.loaded) {
      $('#body').addClass('fixed');
    }

    window.addEventListener('scroll', this.detectScroll, false);
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    window.removeEventListener('scroll', this.detectScroll, false);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.loaded !== prevProps.loaded && this.props.loaded) {
      setTimeout(() => {
        $('#logo .right').addClass('op');
      }, 750);

      setTimeout(() => {
        $('#logo .left, #logo .right').addClass('init');
      }, 1000);

      setTimeout(() => {
        $('#body').addClass('logoLoaded');
      }, 1300);

      setTimeout(() => {
        $('#body').removeClass('fixed');
        $('#body #logo').addClass('loaded');
        if (this._isMounted) {
          this.setState({ finallyLoaded: true });
        }
      }, 1500);

      setTimeout(() => {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
          this.props.onChange();
        }
      }, 5750);
    }
  }

  render() {
    const { loaded } = this.props;

    return (
      <div id="logo" className={this.state.finallyLoaded ? 'loaded' : ''}>
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
