import * as React from 'react';
import { Alert, Button, FormGroup, Input, Label } from 'reactstrap';

import FacebookButton from '../../utils/Facebook/FacebookButton';

import { AuthContext } from '../../../providers/AuthProvider';

import 'styles/pages/user/login.scss';
import { AccountConfirmation } from '../admin/people/AccountConfirmation';
import LoaderButton from '../../utils/LoaderButton';
import { ResetPassword } from './ResetPassword';

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  email: string;
  password: string;
  errorMessage: string | undefined;
  alertMessage: string | undefined;
  passwordReset: boolean;
  notConfirmed: boolean;
  isLoading: boolean;
}

const ErrorMessage = (props: {message: string | undefined}) => (props.message ? <Alert color="danger">{props.message}</Alert> : <></>);
const AlertMessage = (props: {message: string| undefined}) => (props.message ? <Alert color="warning">{props.message}</Alert> : <></>);

export class Login extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      errorMessage: undefined,
      alertMessage: undefined,
      passwordReset: false,
      notConfirmed: false,
      isLoading: false
    };

  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  async handleSubmit(event: any) { // tslint:disable-line: no-any
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
        this.setState( { notConfirmed: true, isLoading: false });

      } else if (e.code === 'PasswordResetRequiredException') {
        // The error happens when the password is reset in the Cognito console
        // In this case you need to call forgotPassword to reset the password
        // Please check the Forgot Password part.
        this.setState( { alertMessage: 'Your password needs to be reset before logging in.', passwordReset: true, isLoading: false });
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
        console.log(e);
      }

    }
  }

  render() {
    if (this.state.passwordReset) {
      return (
        <>
          <AlertMessage message={this.state.alertMessage} />
          <ResetPassword email={this.state.email} />
        </>
      );
    }

    if (this.state.notConfirmed) {
      return (
        <>
          <ErrorMessage message={this.state.errorMessage}/>
          <AccountConfirmation email={this.state.email} />
        </>
      );
    }

    return (
      <div className="login">
        <ErrorMessage message={this.state.errorMessage}/>
        <AlertMessage message={this.state.alertMessage} />
        <form onSubmit={(e) => { this.handleSubmit(e); }} className="small">
          <FormGroup id="email">
            <Label>Email</Label>
            <Input
              autoFocus
              type="email"
              value={this.state.email}
              onChange={(e) => this.setState({email: e.target.value, errorMessage: undefined, alertMessage: undefined})}
            />
          </FormGroup>
          <FormGroup id="password">
            <Label>Password</Label>
            <Input
              value={this.state.password}
              onChange={(e) => this.setState({password: e.target.value, errorMessage: undefined, alertMessage: undefined})}
              type="password"
            />
          </FormGroup>
          <LoaderButton
            block
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Login"
            loadingText="Logging you in.…"
          />
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
        </form>
      </div>
    );
  }
}

// Bind AuthContext to Login so we can access things outside of the child <AuthConsumer> JSX tag
Login.contextType = AuthContext;
