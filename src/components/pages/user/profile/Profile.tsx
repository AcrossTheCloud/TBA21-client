import * as React from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';

import DeleteAccount from './DeleteAccount';
import { checkAuth, logout } from '../../../utils/Auth';
import { deleteAccount, dispatchError } from 'src/actions/user/profile';

import 'src/styles/pages/user/profile/profile.scss';

interface Props {
  hasError: boolean;
  deleteAccount: Function;
  dispatchError: Function;
  accountDeleted: boolean;
  deletingAccount: boolean;
  history: any; // tslint:disable-line: no-any
}

interface State {
  isAuthenticated: boolean;
}

class Profile extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isAuthenticated: false
    };
  }

  async componentDidMount(): Promise<void> {
    const { isAuthenticated } = await checkAuth();

    // Redirect to login page if not authenticated.
    if (!isAuthenticated) {
      this.props.history.push(`/login`);
    }
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

  render() {
    if (this.props.hasError) {
      return (
        <Alert color="danger">An error has occurred.</Alert>
      );
    }

    return (
      <Container id="profile">
        <div className={this.props.deletingAccount ? 'overlay' : ''} />
        Your Profile<br />

        <Form onSubmit={(e) => { e.preventDefault(); console.log('hey'); }}>
          <FormGroup>
            <Label for="exampleEmail">Email</Label>
            <Input type="email" name="email" id="exampleEmail" placeholder="Email" />
          </FormGroup>
          <Button>Submit</Button>
        </Form>

        <DeleteAccount isAuthenticated={this.state.isAuthenticated} deleteAccountAction={this.props.deleteAccount}/>
      </Container>
    );
  }
}

const mapStateToProps = (state: { profile: Props }) => ({
  hasError: state.profile.hasError,
  accountDeleted: state.profile.accountDeleted,
  deletingAccount: state.profile.deletingAccount
});

export default connect(mapStateToProps, { deleteAccount, dispatchError })(Profile);
