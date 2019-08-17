import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { debounce } from 'lodash';

import { AuthConsumer } from '../providers/AuthProvider';
import { logoDispatch } from 'actions/home';

import Logo from './layout/Logo';
import 'styles/components/home.scss';

export interface Props {
  logoDispatch: Function;
  logoLoaded: boolean;
}

class HomePage extends React.Component<Props, {}> {
  _isMounted;
  scrollDebounce;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.scrollDebounce = debounce( () => this.handleScroll(), 300);
  }

  componentDidMount(): void {
    this._isMounted = true;
    window.addEventListener('scroll', this.scrollDebounce, false);
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener('scroll', this.scrollDebounce, false);
  }

  handleScroll = () => {
    console.log('scrolled');
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      console.log('At the bottom');
    }
  }

  render() {
    return (
      <div id="home" className="flex-fill">
        <section id="header">
          <AuthConsumer>
            {({ isAuthenticated, logout }) => (
              isAuthenticated ?
                <Button color="link" onClick={() => logout()}><span className="simple-icon-logout"/> Logout</Button>
                :
                <Button color="link" tag={Link} to="/login"><span className="simple-icon-login"/> Login</Button>
            )}
          </AuthConsumer>
        </section>

        <Logo loaded={this.props.logoLoaded} onChange={() => this.props.logoDispatch(true)}/>

        <Link to="/view">Items</Link>

      </div>
    );
  }
}

const mapStateToProps = (state: { home: Props }) => ({
  logoLoaded: state.home.logoLoaded
});

export default connect(mapStateToProps, { logoDispatch })(HomePage);
