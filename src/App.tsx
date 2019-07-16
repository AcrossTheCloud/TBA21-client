import * as React from 'react';
import { Header } from 'components/layout/Header';
import { withRouter, RouteComponentProps } from 'react-router';
import Logo from './components/layout/Logo';

interface State {
  logoLoaded: boolean;
}

class TheApp extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      logoLoaded: false
    };
  }

  render() {
    return (
      <>
        <Header/>

        {
          // Only show the logo on / (home)
          this.props.location.pathname === '/' ?
          <Logo loaded={this.state.logoLoaded} onChange={() => this.setState({ logoLoaded: true })}/> :
          <></>
        }
      </>
    );
  }
}

export const App = withRouter(TheApp);
