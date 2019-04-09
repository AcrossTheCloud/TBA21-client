import * as React from 'react';
import { Auth } from 'aws-amplify';
import { Button } from 'reactstrap';
import { waitForInit } from './Facebook';

interface Props {
  onLogin: Function;
}
interface State {
  isLoading: boolean;
  sdkLoaded: boolean;
  email: string;
  password: string;
}

class FacebookButton extends React.Component<Props, State> {

  theWindow: any = window; // tslint:disable-line: no-any

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
    const loadingSDK = await waitForInit();

    if (loadingSDK) {
      this.setState({ sdkLoaded: true, isLoading: false });
    }
  }
  statusChangeCallback = (response: any) => { // tslint:disable-line: no-any
    if (response.status === 'connected') {
      this.handleResponse(response.authResponse);
    } else {
      this.handleError(response);
    }
  }
  checkLoginState = () => {
      this.theWindow.FB.getLoginStatus(this.statusChangeCallback);
  }

  handleClick = () => {
    this.theWindow.FB.login(
      this.checkLoginState,
      {scope: 'public_profile,email'}
    );
  }

  handleError(error: string) {
    alert(error);
  }

  async handleResponse(data: { email: string; accessToken: string; expiresIn: number; }) {

    const { email, accessToken: token, expiresIn } = data;
    const expiresAt = expiresIn * 1000 + new Date().getTime();
    const user = { name, email };

    this.setState({ isLoading: true });

    try {
      const response = await Auth.federatedSignIn(
        'facebook',
        { token, 'expires_at': expiresAt },
        user
      );

      this.setState({ isLoading: false });
      this.props.onLogin(response);
    } catch (e) {
      this.setState({ isLoading: false });
      this.handleError(e);
    }
  }

  render() {
    if (this.state.sdkLoaded) {
      return (
        <Button
          block
          onClick={this.handleClick}
          disabled={this.state.isLoading}
        >
        Login with Facebook
        </Button>
      );
    } else {
      return <></>;
    }
  }
}

export default FacebookButton;
