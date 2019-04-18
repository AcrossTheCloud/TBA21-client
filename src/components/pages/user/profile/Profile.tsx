import * as React from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { get, has } from 'lodash';
import * as $ from 'jquery';

import DeleteAccount from './DeleteAccount';
import { getCurrentAuthenticatedUser, logout } from '../../../utils/Auth';
import { deleteAccount, dispatchError, updateAttributes, changePassword } from 'src/actions/user/profile';

import 'src/styles/pages/user/profile/profile.scss';

interface Props {
  errorMessage: string | boolean;
  successMessage: string | boolean;

  deleteAccount: Function;
  dispatchError: Function;
  updateAttributes: Function;
  changePassword: Function;

  accountDeleted: boolean;
  overlay: boolean;
  history: any; // tslint:disable-line: no-any
}

interface State {
  isAuthenticated: boolean;
  credentials: {};
  passwordsMatch: boolean;
}

const ErrorMessage = (props: {message: string | boolean}) => {
  return (
    <Alert color="danger">
      {props.message ? props.message : 'An error has occurred.'}
    </Alert>
  );
};
const SuccessMessage = (props: {message: string | boolean}) => {
  if (typeof props.message !== 'boolean') {
    return (
      <Alert color="success">
        {props.message}
      </Alert>
    );
  } else {
    return <></>;
  }
};

class Profile extends React.Component<Props, State> {
  private emailInput;
  private newPasswordInput;
  private oldPasswordInput;
  private confirmPasswordInput;
  private confirmPasswordOnChangeTimeout;

  constructor(props: Props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      credentials: {},
      passwordsMatch: false
    };

    this.confirmPasswordOnChangeTimeout = false;
  }

  async componentDidMount(): Promise<void> {
    await this.getUserCredentials();
  }

  async componentDidUpdate(): Promise<void> {
    if (this.props.accountDeleted) {
      try {
        await logout();
        this.props.history.push('/');
      } catch (e) {
        this.props.dispatchError();
      }
    }
  }

  getUserCredentials = async (): Promise<void> => {
    const userDetails = await getCurrentAuthenticatedUser(true);

    // Redirect to login page if not authenticated.
    if (!userDetails) {
      this.props.history.push(`/login`);
    } else {
      const email = has(userDetails, 'attributes.email') ? get(userDetails, 'attributes.email') : null;

      let userCredentials = {
        email: email
      };

      this.setState({ credentials: userCredentials });
      this.emailInput.value = email;
    }
  }

  submitForm = async (): Promise<void> => {
    let attributes = {};

    if (this.emailInput.value !== get(this.state.credentials, 'email')) {
      Object.assign(attributes, {'email': this.emailInput.value.toString()});
    }

    if (Object.keys(attributes).length) {
      await this.props.updateAttributes(attributes);
      await this.getUserCredentials();
    }
  }

  changePassword = () => {
    this.props.changePassword(this.oldPasswordInput.value, this.newPasswordInput.value);
    this.oldPasswordInput.value = '';
    this.newPasswordInput.value = '';
    this.confirmPasswordInput.value = '';
    this.setState({ passwordsMatch: false });
  }

  confirmPasswordOnChange = () => {
    const cancelTimeout = () => {
      clearTimeout(this.confirmPasswordOnChangeTimeout);
      this.confirmPasswordOnChangeTimeout = false;
    };

    if (!this.confirmPasswordOnChangeTimeout && this.oldPasswordInput.value) {
      this.confirmPasswordOnChangeTimeout = setTimeout( () => {
        if (this.newPasswordInput.value === this.confirmPasswordInput.value) {
          cancelTimeout();
          this.setState({ passwordsMatch: true });
        } else {
          cancelTimeout();
          this.setState({ passwordsMatch: false });
        }
      },
                                                        500);
    } else {
      cancelTimeout();
    }
  }

  render() {
    const credentials = this.state.credentials;

    if (this.props.overlay) {
      $('.overlay')
        .addClass('on')
        .css('z-index', 99999)
        .fadeIn(300);
    } else {
      $('.overlay.on')
        .removeClass('on')
        .fadeOut(300, () => { $(this).css('z-index', -100); });
    }

    return(
      <Container id="profile">

        {this.props.errorMessage ? <ErrorMessage message={this.props.errorMessage} /> : <></>}
        {this.props.successMessage ? <SuccessMessage message={this.props.successMessage} /> : <></>}

        <div className="overlay" style={{display: 'none'}} />
        Your Profile<br />

        <Form onSubmit={(e) => { e.preventDefault(); this.submitForm(); }} autoComplete="off">
          <FormGroup>
            <Label for="email">Email Address</Label>
            <Input type="email" name="email" id="email" placeholder="Email" innerRef={e => this.emailInput = e} defaultValue={has(credentials, 'email') ? get(credentials, 'email') : ''} />
          </FormGroup>

          <Button>Submit</Button>
        </Form>

        <h3>Change Password</h3>
        <Form onSubmit={(e) => { e.preventDefault(); this.changePassword(); }} autoComplete="off">
          <FormGroup>
            <Label for="oldPassword">Old Password</Label>
            <Input type="password" name="oldPassword" id="oldPassword" placeholder="Old Password" innerRef={e => this.oldPasswordInput = e}/>
          </FormGroup>

          <FormGroup>
            <Label for="newPassword">New Password</Label>
            <Input type="password" name="newPassword" id="newPassword" placeholder="New Password" innerRef={e => this.newPasswordInput = e}/>

            <Label for="confirmPassword">Confirm Password</Label>
            <Input type="password" name="confirmPassword" id="confirmPassword" onChange={this.confirmPasswordOnChange} placeholder="Confirm Password" innerRef={e => this.confirmPasswordInput = e}/>
          </FormGroup>

          {this.state.passwordsMatch ? <Button>Change</Button> : <></>}
        </Form>

        <DeleteAccount isAuthenticated={this.state.isAuthenticated} deleteAccountAction={this.props.deleteAccount}/>
      </Container>
    );
  }
}

const mapStateToProps = (state: { profile: Props }) => ({
  errorMessage: state.profile.errorMessage,
  successMessage: state.profile.successMessage,

  updateAttributes: state.profile.updateAttributes,
  accountDeleted: state.profile.accountDeleted,
  overlay: state.profile.overlay
});

const mapDispatchToProps = {
  deleteAccount,
  dispatchError,
  updateAttributes,
  changePassword,
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
