import * as React from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';

import { loadFacebookSDK } from '../../utils/Facebook/FacebookSDK';
import FacebookButton from '../../utils/Facebook/FacebookButton';

import { AuthConsumer } from '../../../Providers/AuthProvider';

import 'styles/pages/user/login.scss';

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  email: string;
  password: string;
}

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };

    loadFacebookSDK();
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  async handleSubmit(event: any, loginFunction: Function) { // tslint:disable-line: no-any
    event.preventDefault();
    await loginFunction(this.state.email, this.state.password);
  }

  render() {
    return (
      <AuthConsumer>
        {({ login }) => (
          <div className={'login'}>
            <form onSubmit={(e) => { this.handleSubmit(e, login); }} className={'small'}>
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
              <FacebookButton />
            </form>
          </div>
        )}
      </AuthConsumer>
    );
  }
}
