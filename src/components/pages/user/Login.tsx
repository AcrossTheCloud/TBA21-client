import * as React from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import { Auth } from 'aws-amplify';
import 'styles/pages/user/login.scss';
import { loadFacebookSDK } from '../../utils/Facebook/FacebookSDK';
import FacebookButton from '../../utils/Facebook/FacebookButton';

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  email: string;
  password: string;
}

export class Login extends React.Component<Props, State> {

  constructor(props: any) { // tslint:disable-line: no-any
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

  handleFbLogin = () => {
    this.props.history.push('/');
  }

  async handleSubmit(event: any) { // tslint:disable-line: no-any
    event.preventDefault();
    try {
      await Auth.signIn(this.state.email, this.state.password);
      this.props.history.push('/');
    } catch (e) {
      alert(e.message);
    }
  }

  render() {
    return (
      <div className={'login'}>
        <form onSubmit={(e) => { this.handleSubmit(e); }} className={'small'}>
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
          <FacebookButton
            onLogin={this.handleFbLogin}
          />
        </form>

      </div>
    );
  }
}
