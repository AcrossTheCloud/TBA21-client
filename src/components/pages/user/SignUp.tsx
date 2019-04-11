import * as React from 'react';
import {
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { Auth } from 'aws-amplify';
import { ISignUpResult } from 'amazon-cognito-identity-js';

import LoaderButton from 'src/components/utils/LoaderButton';
import 'styles/pages/user/signup.scss';
import { checkAuth } from '../../utils/Auth';

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
}

export class SignUp extends React.Component<Props, State> { // tslint:disable-line: no-any

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
      email: '',
      password: '',
      confirmPassword: '',
      confirmationCode: '',
      newUser: null
    };
  }

  async componentDidMount(): Promise<void> {
    const { isAuthenticated } = await checkAuth();

    // Redirect to home page if authenticated.
    if (isAuthenticated) {
      this.props.history.push(`/`);
    }
  }

  validateForm() {
    return (
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
  }

  handleSubmit = async (event: any) => { // tslint:disable-line: no-any
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      const newUser = await Auth.signUp({
        username: this.state.email,
        password: this.state.password
      });
      this.setState({
        newUser
      });
    } catch (e) {
      alert(e.message);
    }

    this.setState({ isLoading: false });
  }

  handleConfirmationSubmit = async (event: any) => { // tslint:disable-line: no-any
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);
      await Auth.signIn(this.state.email, this.state.password);

      // this.props.userHasAuthenticated(true);
      this.props.history.push('/login');
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  }

  renderConfirmationForm() {
    return (
      <form onSubmit={this.handleConfirmationSubmit}>
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
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.handleSubmit} className={'small'}>
        <FormGroup id="email">
          <Label>Email</Label>
          <Input
            autoFocus
            type="email"
            value={this.state.email}
            onChange={(e) => this.setState({email: e.target.value})}
          />
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
      </form>
    );
  }

  render() {
    return (
      <div className={'signUp'}>
        {this.state.newUser === null
          ? this.renderForm()
          : this.renderConfirmationForm()}
      </div>
    );
  }
}
