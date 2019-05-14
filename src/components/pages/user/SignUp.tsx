import * as React from 'react';
import {
  Alert,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { Auth } from 'aws-amplify';
import { ISignUpResult } from 'amazon-cognito-identity-js';

import LoaderButton from 'src/components/utils/LoaderButton';
import 'styles/pages/user/signup.scss';
import { AccountConfirmation } from '../..';
import FacebookButton from '../../utils/Facebook/FacebookButton';

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  isLoading: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  confirmationCode: string;
  newUser: null | ISignUpResult;
  isSignUp: boolean;
  hasFbLoaded: boolean;
  hasMessage?: boolean;
}

export class SignUp extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
      email: '',
      password: '',
      confirmPassword: '',
      confirmationCode: '',
      newUser: null,
      isSignUp: true,
      hasFbLoaded: false
    };
  }

  /**
   * We pass this to FacebookButton as props to access the users information
   * @param response an object returned from Facebook FB.api
   */
  setUserDetails = (response: any) => {// tslint:disable-line: no-any
    if (response.email) {
      this.setState({
        email: response.email,
        hasFbLoaded: true
      });
    } else {
      this.setState({
        hasFbLoaded: true,
        hasMessage: true
      });
    }
  }
  validateForm() {
    return (
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  handleSubmit = async (event: any) => { // tslint:disable-line: no-any
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      const newUser = await Auth.signUp({
        username: this.state.email,
        password: this.state.password
      });

      this.setState({ newUser });
    } catch (e) {
      alert(e.message);
    }

    this.setState({ isLoading: false });
  }

  render() {
    if (!this.state.newUser) {
      return (
        <div className="signUp">
          <form onSubmit={this.handleSubmit} className="small">
            <FormGroup id="email">
              <Label>Email</Label>
              <Input
                autoFocus
                type="email"
                value={this.state.email}
                onChange={(e) => this.setState({email: e.target.value})}
                disabled={this.state.hasFbLoaded}
              />
              {this.state.hasMessage ? <Alert color="warning">Please enter your details as we were unable to retrieve them from Facebook.</Alert> : <></>}
            </FormGroup>
              <FormGroup id="password">
              <Label>Password</Label>
              <Input
                value={this.state.password}
                onChange={(e) => this.setState({password: e.target.value})}
                type="password"
              />
            </FormGroup>
            <FormGroup id="confirmPassword">
              <Label>Confirm Password</Label>
              <Input
                value={this.state.confirmPassword}
                onChange={(e) => this.setState({confirmPassword: e.target.value})}
                type="password"
              />
            </FormGroup>
            <LoaderButton
              block
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Signup"
              loadingText="Signing up…"
            />
           <br />
            <FormGroup>
              {!this.state.hasFbLoaded ? <FacebookButton isSignUp={this.state.isSignUp} setUserDetails={this.setUserDetails} /> : <></>}
            </FormGroup>
          </form>
        </div>
      );
    } else {
      return <AccountConfirmation email={this.state.newUser.user.getUsername()} />;
    }
  }
}
