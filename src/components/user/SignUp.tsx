import * as React from 'react';
import {
  Col,
  Container, Form,
  FormGroup,
  Input, Row
} from 'reactstrap';
import { Auth } from 'aws-amplify';
import { ISignUpResult } from 'amazon-cognito-identity-js';

import LoaderButton from 'components/utils/LoaderButton';
import FacebookButton from 'components/utils/facebook/FacebookButton';
import { AccountConfirmation } from './AccountConfirmation';
import { PasswordForm } from 'components/utils/inputs/PasswordForm';
import { Alerts, ErrorMessage, WarningMessage } from '../utils/alerts';

import 'styles/components/user/signup.scss';
import { validateEmail } from '../utils/inputs/email';

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

  /**
   *
   * Attempts to sign up the user in Cognito, and shows confirmation code screen
   * Otherwise show a friendly error
   *
   * @param event {React.FormEvent} Mouse Click
   */
  handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    this.setState({ errorMessage: undefined, isLoading: true });

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
        this.setState({ errorMessage: e });
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
      this.setState({ passwordValid: false, formValid: false });
    } else {
      this.setState({ password: password, passwordValid: true, formValid: validateEmail(this.state.email), errorMessage: undefined });
    }
  }

  confirmPassword = (inputField: JSX.Element) => {
    return (
      <Row>
        <FormGroup class="confirmPassword" className="col-md-8">
          {inputField}
        </FormGroup>
        <Col md="4" className="pl-md-0">
          <LoaderButton
            block
            disabled={!this.state.formValid || !this.state.passwordValid}
            type="submit"
            isLoading={this.state.isLoading}
            text="Sign Up"
            loadingText="Signing up…"
          />
        </Col>
      </Row>
    );
  }

  render() {
    if (!this.state.newUser) {
      return (
        <Container className="signUp">
          <Row>
            <Col>
              <ErrorMessage message={this.state.errorMessage} />
              <WarningMessage message={this.state.warningMessage} />
              {this.state.hasMessage ? <WarningMessage message="Please enter your details as we were unable to retrieve them from Facebook." /> : <></>}
            </Col>
          </Row>
          <Row className="min-h-100">
            <Col className="align-self-center">
              <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Input
                    autoFocus
                    type="email"
                    placeholder="Email Address"
                    value={this.state.email}
                    onChange={e => this.setState({ email: e.target.value, formValid: validateEmail(e.target.value) })}
                    disabled={this.state.hasFbLoaded}
                  />
                </FormGroup>

                <PasswordForm callback={this.passwordCallback} confirmPasswordWrapper={this.confirmPassword} />

                <>{!this.state.hasFbLoaded ? <FacebookButton isSignUp={true} setUserDetails={this.setUserDetails} /> : <></>}</>
              </Form>
            </Col>
          </Row>
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
