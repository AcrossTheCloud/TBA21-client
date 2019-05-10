import * as React from 'react';
import { Button } from 'reactstrap';
import { waitForInit } from './facebookSDK';
import { AuthConsumer } from 'src/providers/AuthProvider';

interface State {
  isLoading: boolean;
  sdkLoaded: boolean;
  email: string;
  password: string;
}

class FacebookButton extends React.Component<{}, State> {

  theWindow: any = window; // tslint:disable-line: no-any
  _isMounted = false;

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      sdkLoaded: false,
      isLoading: true,
      email: '',
      password: ''
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      const loadingSDK = await waitForInit();
      if (loadingSDK) {
        this.setState({ sdkLoaded: true, isLoading: false });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleClick = (e: React.MouseEvent<HTMLButtonElement>, authProviderCallback: Function): void  => {
    this.theWindow.FB.login(
      () => {
        this.theWindow.FB.getLoginStatus( async (response: any): Promise<void> => { // tslint:disable-line: no-any
          if (response.status === 'connected') {
            this.setState({ isLoading: true });
            await authProviderCallback(response.authResponse);
          } else {
            this.setState({ isLoading: false });
            this.handleError(response);
          }
        });
      },
      {scope: 'public_profile,email'});
  }

  handleError(error: string) {
    alert(error);
  }

  render() {
    if (this.state.sdkLoaded) {
      return (
        <AuthConsumer>
          {({ facebookLogin }) => (
            <Button
              block
              onClick={e => this.handleClick(e, facebookLogin)}
              disabled={this.state.isLoading}
            >
            Login with Facebook
            </Button>
          )}
        </AuthConsumer>
      );
    } else {
      return <></>;
    }
  }
}

export default FacebookButton;
