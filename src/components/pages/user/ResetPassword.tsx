import * as React from 'react';
import {
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { has, get } from 'lodash';
import { Auth } from 'aws-amplify';
import LoaderButton from 'src/components/utils/LoaderButton';
import 'styles/pages/user/resetPassword.scss';
import { RouteComponentProps, withRouter } from 'react-router';

export class ResetPasswordClass extends React.Component<RouteComponentProps, {}> {
  matchEmail;

  state: {
    isLoading: false,
    email: '',
    password: '',
    confirmPassword: '',
    confirmationCode: '',
    reset: null
  };

  constructor(props: RouteComponentProps) {
    super(props);

    this.matchEmail = has(this.props.match, 'params.email') ? get(this.props.match, 'params.email') : undefined;

    this.state = {
      isLoading: false,
      email: '',
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
    return this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword &&
      this.state.confirmationCode.length > 0;
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
      alert(e.message);
      this.setState({ isLoading: false });
    }
  }

  renderNewPasswordForm() {
    return (
      <form onSubmit={this.handleNewPasswordSubmit} className={'small'}>
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
          Please check your email for the code.
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
        {this.state.reset === null && !this.matchEmail ? this.renderResetForm() : this.renderNewPasswordForm()}
      </div>
    );
  }
}

// Passes in history for us :)
export const ResetPassword = withRouter(ResetPasswordClass);
