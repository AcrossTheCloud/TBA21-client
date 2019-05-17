import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
  Alert,
  Button,
  Container,
  FormGroup,
  Input,
  Label
} from 'reactstrap';

import { Auth } from 'aws-amplify';
import LoaderButton from 'components/utils/LoaderButton';

import { PasswordForm } from 'components/utils/inputs/PasswordForm';
import { AccountConfirmation } from './AccountConfirmation';

import 'styles/pages/user/resetPassword.scss';

interface State {
  errorMessage: string | undefined;
  alertMessage: string | undefined;
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

const ErrorMessage = (props: {message: string | undefined}) => (props.message ? <Alert color="danger">{props.message}</Alert> : <></>);
const AlertMessage = (props: {message: string| undefined}) => (props.message ? <Alert color="warning">{props.message}</Alert> : <></>);

export class ResetPasswordClass extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: undefined,
      alertMessage: undefined,
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
      alertMessage: string | undefined = undefined,
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
        errorMessage = 'We\'ve hit a wall, you\'ve requested another confirmation code however, we sent you one recently.';
      } else if (e.code === 'InvalidParameterException') {
        try {
          await Auth.resendSignUp(this.state.email);

          errorMessage = 'Your account has not been confirmed, you need to confirm it before you can reset your password.';
          alertMessage = 'Please check your email for a verification code.';

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
      alertMessage: alertMessage
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
          <ErrorMessage message={this.state.errorMessage}/>
          <AlertMessage message={this.state.alertMessage}/>
          <AccountConfirmation email={this.state.email} sentCode={true} />
        </Container>
      );
    }

    return (
      <Container className="resetPassword">
        <ErrorMessage message={this.state.errorMessage}/>
        {
          this.state.reset === null && !this.props.email ?
            <form onSubmit={this.handleResetSubmit}>
              <FormGroup id="email">
                <Label>Email</Label>
                <Input
                  autoFocus
                  type="email"
                  value={this.state.email}
                  onChange={(e) => this.setState({email: e.target.value})}
                />
              </FormGroup>
              <LoaderButton
                block
                disabled={!this.validateResetForm()}
                type="submit"
                isLoading={this.state.isLoading}
                text="Reset"
                loadingText="Resetting…"
              />
            </form>
            :
            <form onSubmit={this.handleNewPasswordSubmit} className="small">
              {
                this.props.email ?
                  <FormGroup id="email">
                    <Label>Email</Label>
                    <Input
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
                <Label>Confirmation Code</Label>
                <Input
                  autoFocus
                  type="tel"
                  value={this.state.confirmationCode}
                  onChange={e => this.onConfirmationCodeChange(e.target.value)}
                />
                Please check your email for the code{this.state.hasResentCode ? '.' : <> or <Button color="link" href="#" onClick={this.resendConfirmationCode}>resend the code</Button>.</>}
              </FormGroup>

              <LoaderButton
                block
                disabled={!this.state.formValid || !this.state.passwordValid}
                type="submit"
                isLoading={this.state.isLoading}
                text="Verify"
                loadingText="Verifying…"
              />
            </form>
        }
      </Container>
    );
  }
}

// Passes in history for us :)
export const ResetPassword = withRouter(ResetPasswordClass);
