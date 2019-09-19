import * as React from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';

interface Props {
  changePassword: Function;
}

interface State {
  passwordsMatch: boolean;
}

export default class ChangePassword extends React.Component<Props, State> {
  private newPasswordInput;
  private oldPasswordInput;
  private confirmPasswordInput;
  private confirmPasswordOnChangeTimeout;
  private _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;
    this.state = {
      passwordsMatch: false
    };

    this.confirmPasswordOnChangeTimeout = false;
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  changePassword = () => {
    this.props.changePassword(this.oldPasswordInput.value, this.newPasswordInput.value);
    this.oldPasswordInput.value = '';
    this.newPasswordInput.value = '';
    this.confirmPasswordInput.value = '';
    if (this._isMounted) {
      this.setState({passwordsMatch: false});
    }
  }

  confirmPasswordOnChange = () => {
    const cancelTimeout = () => {
      clearTimeout(this.confirmPasswordOnChangeTimeout);
      this.confirmPasswordOnChangeTimeout = false;
    };

    this.confirmPasswordOnChangeTimeout = setTimeout( () => {

      if (this._isMounted) {
        if (this.newPasswordInput.value === this.confirmPasswordInput.value) {
          if (this.oldPasswordInput.value) {
            this.setState({passwordsMatch: true});
          } else {
            this.setState({passwordsMatch: false});
          }
          cancelTimeout();
        } else {
          this.setState({passwordsMatch: false});
          cancelTimeout();
        }
      }
    },
                                                      500);
  }

  render() {
    return (
      <div className="changePassword">
        <h3>Change Password</h3>
        <Form onSubmit={(e) => { e.preventDefault(); this.changePassword(); }} autoComplete="off">
          <FormGroup>
            <Label for="oldPassword">Old Password</Label>
            <Input type="password" name="oldPassword" id="oldPassword" placeholder="Old Password" innerRef={e => this.oldPasswordInput = e} onChange={this.confirmPasswordOnChange}/>
          </FormGroup>

          <FormGroup>
            <Label for="newPassword">New Password</Label>
            <Input type="password" name="newPassword" id="newPassword" placeholder="New Password" innerRef={e => this.newPasswordInput = e} onChange={this.confirmPasswordOnChange}/>

            <Label for="confirmPassword">Confirm Password</Label>
            <Input type="password" name="confirmPassword" id="confirmPassword" onChange={this.confirmPasswordOnChange} placeholder="Confirm Password" innerRef={e => this.confirmPasswordInput = e}/>
          </FormGroup>

          {this.state.passwordsMatch ? <Button>Change</Button> : <></>}
        </Form>
      </div>
    );
  }
}
