import * as React from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import { Auth } from 'aws-amplify';
import './Login.css';

export class Login extends React.Component<{history: any}, {}> { // tslint:disable-line: no-any

  state: { email: '', password: ''};

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      email: '',
      password: ''
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
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
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
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
        </form>

      </div>
    );
  }
}
