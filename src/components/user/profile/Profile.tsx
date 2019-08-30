import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Button, Container, Form, FormGroup, Input, Label, Spinner } from 'reactstrap';
import { get, has } from 'lodash';
import $ from 'jquery';

import DeleteAccount from 'components/utils/user/DeleteAccount';
import ChangePassword from 'components/utils/user/ChangePassword';
import { AuthContext } from '../../../providers/AuthProvider';
import { deleteAccount, dispatchError, updateAttributes, changePassword, getProfileDetails } from 'actions/user/profile';
import { ErrorMessage, SuccessMessage } from '../../utils/alerts';

import MailChimp from '../../utils/MailChimp';
import { ProfileState } from '../../../reducers/user/profile';

import 'styles/components/user/profile/profile.scss';

interface Props extends RouteComponentProps, ProfileState {
  deleteAccount: Function;
  dispatchError: Function;
  updateAttributes: Function;
  changePassword: Function;
  getProfileDetails: Function;
}

interface State {
  credentials: {};
}

class Profile extends React.Component<Props, State> {
  static contextType = AuthContext;

  private emailInput;
  private _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      credentials: {}
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    await this.getUserCredentials();
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  async componentDidUpdate(): Promise<void> {
    const context: React.ContextType<typeof AuthContext> = this.context;

    if (this.props.accountDeleted) {
      try {
        await context.logout();
        this.props.history.push('/');
      } catch (e) {
        this.props.dispatchError();
      }
    }
  }

  getUserCredentials = async (): Promise<void> => {
    const context: React.ContextType<typeof AuthContext> = this.context;

    const auth = context.authorisation;

    if (!this.props.details) {
      await this.props.getProfileDetails(context.uuid);
    }

    // Redirect to login page if not authenticated.
    if (!auth) {
      this.props.history.push(`/login`);
    } else {

      let userCredentials = {
        email: context.email,
        auth: auth
      };

      if (this._isMounted) {
        this.setState({ credentials: userCredentials });
        this.emailInput.value = userCredentials.email;
      }
    }
  }

  submitForm = async (): Promise<void> => {
    let attributes = {};

    if (this._isMounted) {
      if (this.emailInput.value !== get(this.state.credentials, 'email')) {
        Object.assign(attributes, {'email': this.emailInput.value.toString()});
      }

      if (Object.keys(attributes).length) {
        await this.props.updateAttributes(attributes);
        await this.getUserCredentials();
      }
    }
  }

  overlay = (toggle: boolean = false) => {
    if (toggle) {
      $('.overlay')
        .addClass('on')
        .css('z-index', 99999)
        .fadeIn(300);
    } else {
      $('.overlay.on')
        .removeClass('on')
        .fadeOut(300, () => {
          $(this).css('z-index', -100);
        });
    }
  }

  render() {
    const credentials = this.state.credentials;
    const { details } = this.props;

    if (this._isMounted) {
      this.overlay(this.props.overlay);
    }

    return(
      <Container id="profile">

        <ErrorMessage message={this.props.errorMessage} />
        <SuccessMessage message={this.props.successMessage} />

        <div className="overlay">
          <div className="middle">
            <Spinner type="grow" />
          </div>
        </div>
        <h1>{details ? `Hey, ${details.full_name}` : 'Your Profile'}</h1>

        <Form onSubmit={(e) => { e.preventDefault(); this.submitForm(); }} autoComplete="off">
          <FormGroup>
            <Label for="email">Email Address</Label>
            <Input type="email" name="email" id="email" placeholder="Email" innerRef={e => this.emailInput = e} defaultValue={has(credentials, 'email') ? get(credentials, 'email') : ''} />
          </FormGroup>

          <Button>Submit</Button>
        </Form>

        <ChangePassword changePassword={this.props.changePassword} />

        {has(credentials, 'email') ?
          <>
            <h3>Communication Preferences</h3>
            <MailChimp email={get(credentials, 'email')}/>
          </>
          : <></>
        }

        <DeleteAccount deleteAccountAction={this.props.deleteAccount}/>
      </Container>
    );
  }
}

const mapStateToProps = (state: { profile: Props }) => ({
  errorMessage: state.profile.errorMessage,
  successMessage: state.profile.successMessage,

  updateAttributes: state.profile.updateAttributes,
  accountDeleted: state.profile.accountDeleted,
  overlay: state.profile.overlay,

  details: state.profile.details
});

const mapDispatchToProps = {
  deleteAccount,
  dispatchError,
  updateAttributes,
  changePassword,
  getProfileDetails
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
