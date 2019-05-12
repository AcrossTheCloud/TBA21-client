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
import { AccountConfirmation } from '../admin/people/AccountConfirmation';

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

export class SignUp extends React.Component<Props, State> {

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

  validateForm() {
    return (
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  handleSubmit = async (event: any) => { // tslint:disable-line: no-any
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      const newUser = await Auth.signUp({
        username: this.state.email,
        password: this.state.password
      });

      this.setState({ newUser });
    } catch (e) {
      alert(e.message);
    }

    this.setState({ isLoading: false });
  }

  render() {
    if (!this.state.newUser) {
      return (
        <div className="signUp">
          <form onSubmit={this.handleSubmit} className="small">
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
        </div>
      );
    } else {
      return <AccountConfirmation email={this.state.newUser.user.getUsername()} />;
    }
  }
}
