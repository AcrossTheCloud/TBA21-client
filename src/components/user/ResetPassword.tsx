import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
  Button, Col,
  Container, Form,
  FormGroup,
  Input,
  Row
} from 'reactstrap';

import { Auth } from 'aws-amplify';
import LoaderButton from 'components/utils/LoaderButton';

import { PasswordForm } from 'components/utils/inputs/PasswordForm';
import { AccountConfirmation } from './AccountConfirmation';
import { Alerts, WarningMessage, ErrorMessage } from '../utils/alerts';

import 'styles/components/user/resetPassword.scss';

interface State extends Alerts {
  isLoading: boolean;
  hasResentCode: boolean;
  email: string;
  password: string;
  passwordValid: boolean;
  formValid: boolean;
  notConfirmed: boolean;
  confirmationCode: string;
  reset: null | any;  // tslint:disable-line: no-any
}

interface Props extends RouteComponentProps {
  email?: string;
}

export class ResetPasswordClass extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
      hasResentCode: false,
      email: (this.props.email ? this.props.email : ''),
      confirmationCode: '',
      reset: null,

      password: '',
      passwordValid: false,
      formValid: false,
      notConfirmed: false
    };
  }

  validateResetForm = () => {
    return this.state.email.length > 0;
  }

  /**
   * Validation based off weather or not we passed through an email via props.
   */
  validateNewPasswordForm = () => {
    const validateConfirmationCode = this.validateConfirmationCode(this.state.confirmationCode);
    if (this.props.email) {
      return this.state.email.length > 0 && validateConfirmationCode;
    } else {
      return validateConfirmationCode;
    }
  }

  validateConfirmationCode(code: string) {
    return code.length > 0 && !/\s/.test(code);
  }

  /**
   *
   * Sends reset confirm code to the user and renders a different view.
   *
   * @param event {React.FormEvent}
   */
  handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    this.setState({ isLoading: true });

    let
      errorMessage: string | undefined = undefined,
      warningMessage: string | undefined = undefined,
      state = {
        isLoading: false
      };

    try {
      const reset = await Auth.forgotPassword(this.state.email);
      this.setState({ reset, errorMessage: undefined });
    } catch (e) {
      if (e.code === 'UserNotFoundException') {
        errorMessage = `Looks like there's no account with this email address.`;
      } else if (e.code === 'LimitExceededException') {
        errorMessage = `We've hit a wall, you've requested another confirmation code however, we sent you one recently.`;
      } else if (e.code === 'InvalidParameterException') {
        try {
          await Auth.resendSignUp(this.state.email);

          errorMessage = 'Your account has not been confirmed, you need to confirm it before you can reset your password.';
          warningMessage = 'Please check your email for a verification code.';

          Object.assign(state, {
            hasResentCode: true,
            notConfirmed: true,
            isLoading: false
          });
        } catch (e) {
          // NOTE
          // We get InvalidParameterException if the user is signed up, documentation on responses is non-existent
          if (e.code === 'UserNotFoundException') {
            errorMessage = `Looks like there's no account with this email address.`;
          } else {
            errorMessage = `We're unable to confirm your account due to an error, please contact us. (${e.code})`;
          }
        }
      }
    }

    Object.assign(state, {
      errorMessage: errorMessage,
      warningMessage: warningMessage
    });

    this.setState({ ...state });
  }

  /**
   *
   * Resets the users password with the given confirmation code.
   *
   * @param event {React.FormEvent}
   */
  handleNewPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    this.setState({ isLoading: true });

    try {
      await Auth.forgotPasswordSubmit(this.state.email, this.state.confirmationCode, this.state.password);
      // this.props.userHasAuthenticated(true);
      this.props.history.push('/login');
    } catch (e) {
      let errorMessage: string | undefined = undefined;

      if (e.code === 'CodeMismatchException') {
        errorMessage = 'Invalid verification code provided, please try again.';
      } else {
        errorMessage = `We're having technical difficulties, please contact us. (${e.code})`;
      }

      this.setState({ isLoading: false, errorMessage: errorMessage });
    }
  }

  /**
   * Resends the confirmation code to the user.
   */
  resendConfirmationCode = async () => {
    if (this.state.email) {
      try {
        this.setState({hasResentCode: true});
        await Auth.forgotPassword(this.state.email);
      } catch (e) {
        // NOTE
        // We get InvalidParameterException if the user is signed up and confirmed?, documentation on responses is non-existent
        if (e.code === 'UserNotFoundException') {
          this.setState({errorMessage: `Looks like there's no account with this email address.`});
        } else if (e.code === 'InvalidParameterException') {
          this.setState( { errorMessage: `Looks like your email address has not been confirmed.` });
        } else {
          this.setState( { errorMessage: `We're unable to confirm your account due to an error, please contact us. (${e.code})` });
        }
      }
    }
  }

  /**
   * Updates local state from a callback provided to PasswordForm
   * @param password {String}
   * @param error {String}
   */
  passwordCallback = (password: string, error?: string) => {
    if (error && error.length) {
      this.setState({ errorMessage: error, passwordValid: false, formValid: false });
    } else {
      const formIsValid = this.validateNewPasswordForm();
      this.setState({ password: password, passwordValid: true, formValid: formIsValid, errorMessage: undefined });
    }
  }

  onConfirmationCodeChange = (code: string): void => {
    this.setState({ confirmationCode: code, formValid: this.validateConfirmationCode(code) });
  }

  render() {
    if (this.state.notConfirmed) {
      return (
        <Container className="resetPassword">
          <Row className="min-h-100">
            <Col className="align-self-center">
              <ErrorMessage message={this.state.errorMessage}/>
              <WarningMessage message={this.state.warningMessage}/>
              <AccountConfirmation email={this.state.email} sentCode={true} />
            </Col>
          </Row>
        </Container>
      );
    }

    return (
      <Container className="resetPassword">
        <Row className="min-h-100">
          <Col className="align-self-center">

            <ErrorMessage message={this.state.errorMessage}/>

            {
              this.state.reset === null && !this.props.email ?
                <Form onSubmit={this.handleResetSubmit} className="fullscreen-lines">
                  <Row>
                    <Col md="8" className="pr-md-0">
                      <FormGroup id="email">
                        <Input
                          autoFocus
                          placeholder="Email Address"
                          type="email"
                          value={this.state.email}
                          onChange={(e) => this.setState({email: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4" className="pl-md-0">
                      <LoaderButton
                        block
                        disabled={!this.validateResetForm()}
                        type="submit"
                        isLoading={this.state.isLoading}
                        text="Reset"
                        loadingText="Resetting…"
                      />
                    </Col>
                  </Row>
                </Form>
                :
                <Form onSubmit={this.handleNewPasswordSubmit} className="fullscreen-lines">
                  {
                    this.props.email ?
                      <FormGroup id="email">
                        <Input
                          placeholder="Email Address"
                          autoFocus
                          type="email"
                          value={this.state.email}
                          onChange={(e) => this.setState({email: e.target.value})}
                        />
                      </FormGroup>
                      : <></>
                  }
                  <PasswordForm callback={this.passwordCallback} />
                  <FormGroup id="confirmationCode">
                    <Input
                      autoFocus
                      type="tel"
                      placeholder="Confirmation Code"
                      value={this.state.confirmationCode}
                      onChange={e => this.onConfirmationCodeChange(e.target.value)}
                    />
                    Please check your email for the code{this.state.hasResentCode ? '.' : <> or <Button color="link" onClick={this.resendConfirmationCode}>resend the code</Button>.</>}
                  </FormGroup>

                  <LoaderButton
                    block
                    disabled={!this.state.formValid || !this.state.passwordValid}
                    type="submit"
                    isLoading={this.state.isLoading}
                    text="Verify"
                    loadingText="Verifying…"
                  />
                </Form>
            }
          </Col>
        </Row>
      </Container>
    );
  }
}

// Passes in history for us :)
export const ResetPassword = withRouter(ResetPasswordClass);
