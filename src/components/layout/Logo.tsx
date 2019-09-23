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
  animating: boolean = false;
  animatingInterval;

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

      const
        $rightAndLeft = $('#logo .left, #logo .right');

      setTimeout( () => {
        $rightAndLeft.addClass('init');
        this.animating = true;
      }, 500);

      this.animatingInterval = setInterval( () => {
        if (this.animating) {
          this.animating = false;
          $rightAndLeft.addClass('init');
        } else {
          this.animating = true;
          $rightAndLeft.removeClass('init');
        }
      }, 3000);
    } else {
      $('#logo .left, #logo .right').addClass('init');
      $('#body').removeClass('fixed').addClass('logoLoaded');
      $('#body #logo').addClass('loaded');
    }

    window.addEventListener('scroll', this.detectScroll, false);
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    $('#body').removeClass('fixed');
    window.removeEventListener('scroll', this.detectScroll, false);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {

    if (this.props.loaded !== prevProps.loaded && this.props.loaded) {
      this.animating = true;
      clearInterval(this.animatingInterval);

      setTimeout(() => {
        $('#logo .left, #logo .right').addClass('init');
      }, 1000);

      setTimeout(() => {
        $('#body').addClass('logoLoaded');
      }, 2000);

      setTimeout(() => {
        $('#body #logo').addClass('loaded');
        $('#body').removeClass('fixed');
        if (this._isMounted) {
          this.setState({ finallyLoaded: true });
        }
      }, 2500);
    }
  }

  render() {
    return (
      <div id="logo">
        <header>
          <div className={`left show`}>
            <img src={logo} alt="Ocean Archive" />
          </div>

          <div className={`right show op`}>
            <img src={logo} alt="Ocean Archive" />
          </div>
        </header>
      </div>
    );
  }
}
