import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { AuthConsumer } from '../providers/AuthProvider';
import { logoDispatch } from 'actions/home';
import { Header } from 'components/layout/Header';

import Logo from './layout/Logo';
import 'styles/components/home.scss';

interface Props {
  logoDispatch: Function;
  logoLoaded: boolean;
}

class HomePage extends React.Component<Props, {}> {
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

          <Header/>
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
