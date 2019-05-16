import * as React from 'react';
import { Alert, Button, FormGroup, Input, Label } from 'reactstrap';

import FacebookButton from 'components/utils/facebook/FacebookButton';
import { AuthContext } from 'providers/AuthProvider';
import { AccountConfirmation } from 'components/user/AccountConfirmation';

import 'styles/components/user/login.scss';

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  email: string;
  password: string;
  errorMessage: string | undefined;
  notConfirmed: boolean;
}

export class Login extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      errorMessage: undefined,
      notConfirmed: false
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  async handleSubmit(event: any) { // tslint:disable-line: no-any
    event.preventDefault();

    const loginFunction = this.context.login;
    try {
      await loginFunction(this.state.email, this.state.password);
    } catch (e) {
      if (e.code === 'UserNotConfirmedException') {
        this.setState( { notConfirmed: true });
      } else if (e.message === 'UserLoginEmailPasswordException') {
        this.setState( { errorMessage: 'We\'ve had a bit of a technical issue.' });
      }
    }
  }

  render() {
    const ErrorMessage = () => (this.state.errorMessage ? <Alert color="danger">{this.state.errorMessage}</Alert> : <></>);

    if (this.state.notConfirmed) {
      return (
        <>
          <ErrorMessage />
          <AccountConfirmation email={this.state.email} />
        </>
      );
    }

    return (
      <div className="login">
        <ErrorMessage />
        <form onSubmit={(e) => { this.handleSubmit(e); }} className="small">
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
          <Button
            block
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
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
