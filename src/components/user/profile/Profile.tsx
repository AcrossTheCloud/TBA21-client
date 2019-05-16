import * as React from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { get, has } from 'lodash';
import $ from 'jquery';

import DeleteAccount from 'components/utils/user/DeleteAccount';
import ChangePassword from 'components/utils/user/ChangePassword';
import { getCurrentAuthenticatedUser, logout } from 'components/utils/Auth';
import { deleteAccount, dispatchError, updateAttributes, changePassword } from 'actions/user/profile';

import 'styles/components/user/profile/profile.scss';

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

  constructor(props: Props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      credentials: {}
    };
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

        <ChangePassword changePassword={this.props.changePassword} />

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
