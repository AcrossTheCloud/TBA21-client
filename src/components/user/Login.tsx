import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Col, Container, Form, FormGroup, Input, Row } from 'reactstrap';

import FacebookButton from 'components/utils/facebook/FacebookButton';
import { AuthContext } from 'providers/AuthProvider';

import { AccountConfirmation } from './AccountConfirmation';
import LoaderButton from 'components/utils/LoaderButton';
import { ResetPassword } from './ResetPassword';
import { Alerts, ErrorMessage, WarningMessage } from '../utils/alerts';

import 'styles/components/user/login.scss';

interface State extends Alerts {
  email: string;
  password: string;
  passwordReset: boolean;
  notConfirmed: boolean;
  isLoading: boolean;
}

class LoginClass extends React.Component<RouteComponentProps, State> {

  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      email: '',
      password: '',
      passwordReset: false,
      notConfirmed: false,
      isLoading: false
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  /**
   * Runs the AuthProvider login function and either redirects to / or shows a friendly error message.
   * @param event {React.FormEvent} Mouse click
   */
  async handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    this.setState( { isLoading: true });

    const loginFunction = this.context.login;
    try {
      await loginFunction(this.state.email, this.state.password);
    } catch (e) {
      if (e.code === 'UserNotConfirmedException') {
        // The error happens if the user didn't finish the confirmation step when signing up
        // In this case you need to resend the code and confirm the user
        // About how to resend the code and confirm the user, please check the signUp part
        this.setState( { warningMessage: 'You need to confirm it before you can reset your password.', notConfirmed: true, isLoading: false });

      } else if (e.code === 'PasswordResetRequiredException') {
        // The error happens when the password is reset in the Cognito console
        // In this case you need to call forgotPassword to reset the password
        // Please check the Forgot Password part.
        this.setState( { warningMessage: 'Your password needs to be reset before logging in.', passwordReset: true, isLoading: false });
      } else if (e.code === 'NotAuthorizedException') {
        // The error happens when the incorrect password is provided
        this.setState( { errorMessage: 'Login details incorrect, try again.', isLoading: false });
      } else if (e.code === 'UserNotFoundException') {
        // The error happens when the supplied username/email does not exist in the Cognito user pool
        this.setState( { errorMessage: 'Login details incorrect, try again.', isLoading: false });
      } else if (e.code === 'UserLoginEmailPasswordException') {
        // Custom error message from the login method in AuthProvider.
        this.setState( { errorMessage: 'We\'ve had a bit of a technical issue.', isLoading: false });
      } else {
        this.setState( { errorMessage: 'We\'ve had a bit of a technical issue.', isLoading: false });
        console.log(e);
      }
      if (e.message === 'UserLoginEmailPasswordException') {
        this.setState( { errorMessage: 'We\'ve had a bit of a technical issue.' });
      }
    }
  }

  render() {
    if (this.state.passwordReset) {
      return (
        <>
          <ErrorMessage message={this.state.errorMessage}/>
          <WarningMessage message={this.state.warningMessage} />
          <ResetPassword email={this.state.email} />
        </>
      );
    }

    if (this.state.notConfirmed) {
      return (
        <Container className="login">
          <Row className="min-h-100">
            <Col className="align-self-center">
              <ErrorMessage message={this.state.errorMessage}/>
              <WarningMessage message={this.state.warningMessage}/>
              <AccountConfirmation email={this.state.email} />
            </Col>
          </Row>
        </Container>
      );
    }

    return (
      <Container className="login">
        <Row className="min-h-100">
          <Col className="align-self-center">

            <ErrorMessage message={this.state.errorMessage}/>
            <WarningMessage message={this.state.warningMessage} />

            <Form onSubmit={(e) => { this.handleSubmit(e); }} className="fullscreen-lines">
              <Row>
                <Col xs="12">
                  <FormGroup id="email">
                    <Input
                      autoFocus
                      disabled={this.state.isLoading}
                      type="email"
                      placeholder="Email Address"
                      value={this.state.email}
                      onChange={(e) => this.setState({email: e.target.value, errorMessage: undefined, warningMessage: undefined})}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="8" className="pr-md-0">
                  <FormGroup id="password">
                    <Input
                      disabled={this.state.isLoading}
                      placeholder="Password"
                      value={this.state.password}
                      onChange={(e) => this.setState({password: e.target.value, errorMessage: undefined, warningMessage: undefined})}
                      type="password"
                    />
                  </FormGroup>
                </Col>
                <Col md="4" className="pl-md-0">
                  <LoaderButton
                    block
                    disabled={!this.validateForm()}
                    type="submit"
                    isLoading={this.state.isLoading}
                    text="Login"
                    loadingText="Logging you in.…"
                  />
                </Col>
              </Row>
              <Button
                block
                onClick={() => { this.props.history.push('/signup'); }}
              >
                Signup
              </Button>
              <Button
                block
                onClick={() => { this.props.history.push('/resetPassword'); }}
              >
                Reset password
              </Button>
              <FacebookButton isSignUp={false} />
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}

// Passes in history for us :)
export const Login = withRouter(LoginClass);

// This goes under the export, don't ask why ..
// Bind AuthContext to Login so we can access things outside of the child <AuthConsumer> JSX tag
LoginClass.contextType = AuthContext;
