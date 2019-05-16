import * as React from 'react';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { get } from 'lodash';

import { getCurrentCredentials } from '../Auth';
import config from '../../../config';

interface State {
  userId?: string;
  userEmail?: string;
  isOpen?: boolean | undefined;
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
  /**
   * Resetting the password and error checking
   */
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
          successMessage: 'User has been sent an email to reset their password.'
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
   *  Toggles the open state for the resetPassword Modal
   */
  resetPasswordModalToggle = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
      successMessage: undefined,
      errorMessage: undefined
    }));
  }
  /**
   *   Get the user details
   */
  loadDetails(userId: string, userEmail: string) {
    if (userId) {
      this.setState({ userId: userId, userEmail: userEmail, isOpen: true });
    } else {
      this.setState({ errorMessage: 'No user id', isOpen: true });
    }
  }
 /**
  * Hide the button if there's a message
  */
  confirmButton = () => {
    if (this.state.errorMessage || this.state.successMessage) {
      return <></>;
    } else {
        return <Button color="danger" onClick={this.resetPassword}>Yes, I'm sure</Button>;
      }
    }

  render() {
    const hasError = (this.state.successMessage || this.state.errorMessage);

    return (
      <Modal isOpen={this.state.isOpen} toggle={this.resetPasswordModalToggle}>
        <ModalHeader>Reset Password</ModalHeader>
        <ModalBody>
          {
            hasError ?
              <>
                {this.state.successMessage ? <Alert color="success">{this.state.successMessage}</Alert> : <></>}
                {this.state.errorMessage ? <Alert color="danger">{this.state.errorMessage}</Alert> : <></>}
              </>
            :
              <>Reset Password for {this.state.userEmail ? this.state.userEmail : this.state.userId}?</>
          }
        </ModalBody>
        <ModalFooter>
          {this.confirmButton()}
          <Button color="secondary" onClick={this.resetPasswordModalToggle}>
            {this.state.successMessage ? 'Ok' : 'Cancel'}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default AdminResetPassword;
