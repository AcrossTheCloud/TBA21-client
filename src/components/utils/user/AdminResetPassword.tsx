import * as React from 'react';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { get } from 'lodash';

import { getCurrentCredentials } from '../Auth';
import config from '../../../config';

interface State {
  userId?: string;
  isOpen?: boolean;
  successMessage?: string | undefined;
  errorMessage?: string | undefined;
}
class AdminResetPassword extends React.Component<{}, State> {
  cognitoIdentityServiceProvider;

  constructor(props: {}) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }
  async componentDidMount(): Promise<void> {
    const credentials = await getCurrentCredentials();

    this.cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
       region: config.cognito.REGION,
       credentials: {
         accessKeyId: get(credentials, 'accessKeyId'),
         sessionToken: get(credentials, 'sessionToken'),
         secretAccessKey: get(credentials, 'data.Credentials.SecretKey'),
       }
     });

    this.setState({
      isOpen: this.state.isOpen
    });
  }

  resetPassword = async (): Promise <void> => {
    if (this.state.userId) {
      try {
        await this.cognitoIdentityServiceProvider.adminResetUserPassword(
          {
            Username: this.state.userId,
            UserPoolId: config.cognito.USER_POOL_ID
          }
        ).promise();
        this.setState({
          successMessage: 'Password has been reset.'
        });
      } catch (e) {
        console.log(e.message);
        this.setState({
          errorMessage: `Something went wrong, please try again later. (${e.message})`
        });
      }
    } else {
      this.setState({
        errorMessage: 'No userid supplied.'
      });
    }
  }
  /**
   * Toggles the open state for the resetPassword Modal
   */
  resetPasswordModalToggle = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
      successMessage: undefined,
      errorMessage: undefined
    }));
  }

  loadDetails(userId: string) {
    if (userId) {
      this.setState({ userId: userId, isOpen: true });
    } else {
      this.setState({ errorMessage: 'No user id', isOpen: true });
    }
  }
  messageCheck = () => {
    if (this.state.errorMessage || this.state.successMessage) {
      return (
        <></>
      );
    } else {
        return (
          <Button color="danger" onClick={this.resetPassword}>Yes, I'm sure</Button>
        );
      }
    }

  render() {
    return (
      <Modal isOpen={this.state.isOpen} toggle={this.resetPasswordModalToggle}>
        <ModalHeader>Reset Password</ModalHeader>
        <ModalBody>
          {this.state.successMessage ? <Alert color="success">{this.state.successMessage}</Alert> : <></>}
          {this.state.errorMessage ? <Alert color="danger">{this.state.errorMessage}</Alert> : <></>}
          Reset Password for {this.state.userId}?
        </ModalBody>
        <ModalFooter>
          {this.messageCheck()}
          <Button color="secondary" onClick={this.resetPasswordModalToggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default AdminResetPassword;