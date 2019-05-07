import * as React from 'react';
import { getCurrentCredentials } from '../Auth';
import { get } from 'lodash';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import config from '../../../config';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

interface State {
  userId?: string;
  userEmail?: string;
  isOpen?: boolean | undefined;
  successMessage?: string | undefined;
  errorMessage?: string | undefined;
}

export class ConfirmUser extends React.Component<{}, State> {
  cognitoIdentityServiceProvider;

  constructor(props: {}) {
    super(props);
    this.state = {
      isOpen: false
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
   * Confirming the user
   */
  confirmUser = async (): Promise <void> => {
    try {
      await this.cognitoIdentityServiceProvider.adminConfirmSignUp(
        {
          Username: this.state.userId,
          UserPoolId: config.cognito.USER_POOL_ID
        }
      ).promise();
      this.setState({
          successMessage: 'User has been confirmed'
                    });
    } catch (e) {
      this.setState({
        errorMessage:  `Something went wrong, please try again later. (${e.message})`
                    });
    }
  }
  /**
   *   Get the user details
   */
  loadDetails(userId: string, userEmail: string) {
    if (userId) {
      this.setState({ userId: userId, userEmail: userEmail, isOpen: true});
    } else {
      this.setState({ errorMessage: 'No user id', isOpen: true });
    }
  }
  confirmUserModal = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
      successMessage: undefined,
      errorMessage: undefined
    }));
  }
  /**
   * Hide the button if there's a message
   */
  confirmButton = () => {
    if (this.state.errorMessage || this.state.successMessage) {
      return <></>;
    } else {
      return <Button color="danger" onClick={this.confirmUser}>Confirm</Button>;
    }
  }

  render() {
    const hasError = (this.state.successMessage || this.state.errorMessage);

    return (
      <Modal isOpen={this.state.isOpen} toggle={this.confirmUserModal}>
        <ModalHeader>Confirm User?</ModalHeader>
        <ModalBody>
          {
            hasError ?
              <>
                {this.state.successMessage ? <Alert color="success">{this.state.successMessage}</Alert> : <></>}
                {this.state.errorMessage ? <Alert color="danger">{this.state.errorMessage}</Alert> : <></>}
              </>
              :
              <>Confirm {this.state.userEmail ? this.state.userEmail : this.state.userId}?</>
          }
        </ModalBody>
        <ModalFooter>
          {this.confirmButton()}
          <Button color="secondary" onClick={this.confirmUserModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
