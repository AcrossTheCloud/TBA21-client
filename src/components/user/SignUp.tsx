import * as React from 'react';
import {
  Col,
  Container, Form,
  FormGroup,
  Input, Row
} from 'reactstrap';
import { API, Auth } from 'aws-amplify';
import { ISignUpResult } from 'amazon-cognito-identity-js';

import LoaderButton from 'components/utils/LoaderButton';
// import FacebookButton from 'components/utils/facebook/FacebookButton';
import { AccountConfirmation } from './AccountConfirmation';
import { PasswordForm } from 'components/utils/inputs/PasswordForm';
import { Alerts, ErrorMessage, WarningMessage } from '../utils/alerts';
import { validateEmail } from '../utils/inputs/email';

import 'styles/components/user/signup.scss';

interface State extends Alerts {
  isLoading: boolean;
  formValid: boolean;
  passwordValid: boolean;

  email: string;
  confirmationCode: string;
  newUser: null | ISignUpResult;

  fullName: string;

  hasFbLoaded: boolean;
  hasMessage?: boolean;

  password: string;
}

export class SignUp extends React.Component<{}, State> {
  _isMounted;

  constructor(props: {}) {
    super(props);

    this._isMounted = false;

    this.state = {
      formValid: false,
      passwordValid: false,

      isLoading: false,
      fullName: '',
      email: '',
      password: '',
      confirmationCode: '',
      newUser: null,
      hasFbLoaded: false
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  /**
   * We pass this to FacebookButton as props to access the users information
   * @param response an object returned from Facebook FB.api
   */
  setUserDetails = (response: any) => {// tslint:disable-line: no-any
    if (!this._isMounted) { return; }

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
    if (!this._isMounted) { return; }
    this.setState({ errorMessage: undefined, isLoading: true });

    try {
      const
        userDetails = {
          username: this.state.email,
          password: this.state.password
        },
        newUser = await Auth.signUp(userDetails);

      await API.put('tba21', 'profiles', {
        body: {
          uuid: newUser.userSub,
          full_name: this.state.fullName
        }
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
    if (!this._isMounted) { return; }
    if (error && error.length) {
      this.setState({ passwordValid: false, formValid: false });
    } else {
      this.setState({ password: password, passwordValid: true, formValid: validateEmail(this.state.email), errorMessage: undefined });
    }
  }

  confirmPassword = (inputField: JSX.Element) => {
    return (
      <Row>
        <FormGroup className="confirmPassword col-md-8 pr-md-0">
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

  isFormValid = () => {
    const state = {};
    let
      errorMessage: JSX.Element = <></>,
      hasError: boolean = false;

    if (!validateEmail(this.state.email)) {
      errorMessage = <>Email is not valid.</>;
      hasError = true;
    }
    if (this.state.fullName.length < 2) {
      errorMessage = (
        <>
          {errorMessage}
          <div>Please enter your full name.</div>
        </>
      );
      hasError = true;
    }

    if (hasError) {
      Object.assign(state, {errorMessage: errorMessage});
    } else {
      Object.assign(state, {errorMessage: undefined});
    }

    this.setState(state);

  }

  render() {
    if (!this.state.newUser) {
      return (
        <Container className="signUp">
          <Row className="min-h-100">
            <Col className="align-self-center">

              <ErrorMessage message={this.state.errorMessage} />
              <WarningMessage message={this.state.warningMessage} />
              {this.state.hasMessage ? <WarningMessage message="Please enter your details as we were unable to retrieve them from Facebook." /> : <></>}

              <Form onSubmit={this.handleSubmit} className="fullscreen-lines">
                <FormGroup>
                  <Input
                    autoFocus
                    type="text"
                    placeholder="Full Name"
                    value={this.state.fullName}
                    onChange={e => {
                      const value = e.target.value;
                      if (this._isMounted) {
                        if (value.length) {
                          this.setState({ fullName: e.target.value }, () => this.isFormValid());
                        }
                      }
                    }}
                    disabled={this.state.hasFbLoaded}
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={this.state.email}
                    onChange={e => {
                      if (this._isMounted) {
                        this.setState({ email: e.target.value }, () => this.isFormValid());
                      }
                    }}
                    disabled={this.state.hasFbLoaded}
                  />
                </FormGroup>

                <PasswordForm callback={this.passwordCallback} confirmPasswordWrapper={this.confirmPassword} />

                {/*<>{!this.state.hasFbLoaded ? <FacebookButton isSignUp={true} setUserDetails={this.setUserDetails} /> : <></>}</>*/}
              </Form>
            </Col>
          </Row>
        </Container>
      );
    } else {
      return (
        <Container className="signUp">
          <Row className="min-h-100">
            <Col className="align-self-center">
              <ErrorMessage message={this.state.errorMessage}/>
              <WarningMessage message={this.state.warningMessage}/>
              <AccountConfirmation email={this.state.newUser.user.getUsername()} />
            </Col>
          </Row>
        </Container>
      );
    }
  }
}
