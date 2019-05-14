import * as React from 'react';
import {
  Alert,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { has, get } from 'lodash';
import { Auth } from 'aws-amplify';
import LoaderButton from 'src/components/utils/LoaderButton';
import 'styles/pages/user/resetPassword.scss';
import { RouteComponentProps, withRouter } from 'react-router';

interface State {
  errorMessage: string | undefined;
  isLoading: boolean;
  hasResentCode: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  confirmationCode: string;
  reset: null | any;  // tslint:disable-line: no-any
}

interface Props extends RouteComponentProps {
  email?: string;
}

const ErrorMessage = (props: {message: string | undefined}) => (props.message ? <Alert color="danger">{props.message}</Alert> : <></>);

export class ResetPasswordClass extends React.Component<Props, State> {
  matchConfirm;

  constructor(props: Props) {
    super(props);

    this.matchConfirm = has(this.props.match, 'params.confirm') ? get(this.props.match, 'params.confirm') : undefined;

    this.state = {
      errorMessage: undefined,
      isLoading: false,
      hasResentCode: false,
      email: '' || (this.props.email ? this.props.email : ''),
      password: '',
      confirmPassword: '',
      confirmationCode: '',
      reset: null
    };
  }

  validateResetForm() {
    return this.state.email.length > 0;
  }

  validateNewPasswordForm() {
    if (this.matchConfirm) {
      return this.state.email.length > 0 &&
        this.state.password.length > 0 &&
        this.state.password === this.state.confirmPassword &&
        this.state.confirmationCode.length > 0;
    } else {
      return this.state.password.length > 0 &&
        this.state.password === this.state.confirmPassword &&
        this.state.confirmationCode.length > 0;
    }
  }

  handleResetSubmit = async (event: any) => { // tslint:disable-line: no-any
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      const reset = await Auth.forgotPassword(this.state.email);
      this.setState({ reset });
    } catch (e) {
      if (e.code === 'InvalidParameterException') {
        this.props.history.push('/confirm/' + this.state.email);
      }
    }

    this.setState({ isLoading: false });
  }

  handleNewPasswordSubmit = async (event: any) => { // tslint:disable-line: no-any
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await Auth.forgotPasswordSubmit(this.state.email, this.state.confirmationCode, this.state.password);
      // this.props.userHasAuthenticated(true);
      this.props.history.push('/login');
    } catch (e) {
      console.log(e, e.message);
      this.setState({ isLoading: false });
    }
  }

  resendConfirmationCode = async () => {
    if (this.state.email) {
      try {
        this.setState({hasResentCode: true});
        await Auth.resendSignUp(this.state.email);
      } catch (e) {
        // NOTE
        // We get InvalidParameterException if the user is signed up, documentation on responses is non-existent
        if (e.code === 'UserNotFoundException') {
          this.setState({errorMessage: 'Looks like there\'s no account with this email address.'});
        } else {
          this.setState( { errorMessage: `We\'re unable to confirm your account due to an error, please contact us. (${e.code})` });
        }
      }
    }
  }

  renderNewPasswordForm() {
    return (
      <form onSubmit={this.handleNewPasswordSubmit} className="small">
        <ErrorMessage message={this.state.errorMessage}/>
        {
          this.matchConfirm ?
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
        <FormGroup id="confirmationCode">
          <Label>Confirmation Code</Label>
          <Input
            autoFocus
            type="tel"
            value={this.state.confirmationCode}
            onChange={(e) => this.setState({confirmationCode: e.target.value})}
          />
          Please check your email for the code{this.state.hasResentCode ? '.' : <> or <a href="#" onClick={this.resendConfirmationCode}>resend the code</a>.</>}
        </FormGroup>
        <LoaderButton
          block
          disabled={!this.validateNewPasswordForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
    );
  }

  renderResetForm() {
    return (
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
    );
  }

  render() {
    return (
      <div className={'resetPassword'}>
        {this.state.reset === null && !this.matchConfirm ? this.renderResetForm() : this.renderNewPasswordForm()}
      </div>
    );
  }
}

// Passes in history for us :)
export const ResetPassword = withRouter(ResetPasswordClass);
