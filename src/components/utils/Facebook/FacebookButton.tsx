import * as React from 'react';
import { Button, Alert } from 'reactstrap';
import { loadFacebookSDK, waitForInit } from './FacebookSDK';
import { AuthConsumer } from '../../../providers/AuthProvider';

interface State {
  isLoading: boolean;
  sdkLoaded: boolean;
  errorMessage?: string;
}
interface Props {
  isSignUp: boolean;
  setUserDetails?: Function;
}

class FacebookButton extends React.Component<Props, State> {

  theWindow: any = window; // tslint:disable-line: no-any
  _isMounted = false;

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      sdkLoaded: false,
      isLoading: true,
    };
    loadFacebookSDK();
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

  /**
   * Getting user details and passing them back to SignUp
   */
  getUserDetails = () => {
    this.theWindow.FB.api('/me', { fields: 'name, email' }, (response: any) => { // tslint:disable-line: no-any
      if (this.props.setUserDetails) {
        this.props.setUserDetails(response);
      }
    });
  }

  handleSignupClick = () => {
    this.theWindow.FB.login(
      () => {
        this.theWindow.FB.getLoginStatus( (response: any): void => { // tslint:disable-line: no-any
          if (response.status === 'connected') {
            this.setState({ isLoading: true });
            this.getUserDetails();
          }
          if (response.error) {
            this.setState({ isLoading: false, errorMessage: response.error });
          } else {
            this.setState({ isLoading: false });
          }
        });
      },
      {scope: 'public_profile,email'});
  }

  handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>, authProviderCallback: Function): void  => {
    this.theWindow.FB.login(
      () => {
        this.theWindow.FB.getLoginStatus( async (response: any): Promise<void> => { // tslint:disable-line: no-any
          if (response.status === 'connected') {
            this.setState({ isLoading: true });
            await authProviderCallback(response.authResponse);
          }
          if (response.error) {
            this.setState({ isLoading: false, errorMessage: response.error });
          } else {
            this.setState({ isLoading: false });
          }
        });
      },
      {scope: 'public_profile,email'});
  }

  render() {
    if (this.state.sdkLoaded && !this.props.isSignUp) {
      return (
        <AuthConsumer>
          {({ facebookLogin }) => (
            <Button
              block
              onClick={e => this.handleLoginClick(e, facebookLogin)}
              disabled={this.state.isLoading}
            >
            Login with Facebook
            </Button>
          )}
        </AuthConsumer>
      );
    }
    if (this.props.isSignUp) {
      return (
        <>
        <Button
          block
          onClick={() => this.handleSignupClick()}
          disabled={this.state.isLoading}
        >
          Sign up with Facebook
        </Button>
          {this.state.errorMessage ? <Alert color="warning">Please enter your details as we were unable to retrieve them from Facebook.</Alert> : <></>}
        </>
      );
    } else {
      return <></>;
    }
  }
}

export default FacebookButton;
