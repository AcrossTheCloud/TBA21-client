import * as React from 'react';
import {
  Container,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { Auth } from 'aws-amplify';
import { ISignUpResult } from 'amazon-cognito-identity-js';

import LoaderButton from 'components/utils/LoaderButton';
import FacebookButton from 'components/utils/facebook/FacebookButton';
import { AccountConfirmation } from './AccountConfirmation';
import { PasswordForm } from 'components/utils/inputs/PasswordForm';
import { Alerts, ErrorMessage, WarningMessage } from '../utils/alerts';

import 'styles/components/user/signup.scss';

interface State extends Alerts {
  isLoading: boolean;
  formValid: boolean;
  passwordValid: boolean;

  email: string;
  confirmationCode: string;
  newUser: null | ISignUpResult;

  hasFbLoaded: boolean;
  hasMessage?: boolean;

  password: string;
}

export class SignUp extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      formValid: false,
      passwordValid: false,

      isLoading: false,
      email: '',
      password: '',
      confirmationCode: '',
      newUser: null,
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

  validateForm = (): boolean => {
    return this.state.email.length > 0;
  }

  onEmailChange = (email: string) => {
    this.setState({ email: email, formValid: this.validateForm() });
  }

  /**
   *
   * Attempts to sign up the user in Cognito, and shows confirmation code screen
   * Otherwise show a friendly error
   *
   * @param event {React.FormEvent} Mouse Click
   */
  handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    this.setState({ errorMessage: '', isLoading: true });

    try {
      const newUser = await Auth.signUp({
        username: this.state.email,
        password: this.state.password
      });

      this.setState({ newUser });
    } catch (e) {
      if (e.code === 'UsernameExistsException') {
        this.setState({ errorMessage: 'There\'s already an account with that email address.' });
      } else if (e.code === 'InvalidPasswordException') {
        this.setState({ errorMessage: 'Your password does not meet our requirements.' });
      } else {
        this.setState({ errorMessage: 'We\'ve had a bit of a technical issue.' });
      }
    }

    this.setState({ isLoading: false });
  }

  /**
   * PasswordForm callback to handle local state.
   * @param password {string}
   * @param error {string}
   */
  passwordCallback = (password: string, error?: string) => {
    if (error && error.length) {
      this.setState({ errorMessage: error, passwordValid: false, formValid: false });
    } else {
      this.setState({ password: password, passwordValid: true, formValid: this.validateForm(), errorMessage: undefined });
    }
  }

  render() {
    if (!this.state.newUser) {
      return (
        <Container className="signUp">
          <ErrorMessage message={this.state.errorMessage} />
          <WarningMessage message={this.state.warningMessage} />
          <form onSubmit={this.handleSubmit} className="small">
            <FormGroup id="email">
              <Label>Email</Label>
              <Input
                autoFocus
                type="email"
                value={this.state.email}
                onChange={e => this.onEmailChange(e.target.value)}
                disabled={this.state.hasFbLoaded}
              />
              {this.state.hasMessage ? <WarningMessage message="Please enter your details as we were unable to retrieve them from Facebook." /> : <></>}
            </FormGroup>

            <PasswordForm callback={this.passwordCallback} />

            <LoaderButton
              block
              disabled={!this.state.formValid || !this.state.passwordValid}
              type="submit"
              isLoading={this.state.isLoading}
              text="Signup"
              loadingText="Signing up…"
            />
           <br />
            <FormGroup>
              {!this.state.hasFbLoaded ? <FacebookButton isSignUp={true} setUserDetails={this.setUserDetails} /> : <></>}
            </FormGroup>
          </form>
        </Container>
      );
    } else {
      return (
        <Container className="signUp">
          <AccountConfirmation email={this.state.newUser.user.getUsername()} />
        </Container>
      );
    }
  }
}
