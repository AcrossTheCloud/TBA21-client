import * as React from 'react';
import { get } from 'lodash';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import config from '../../../config';

import { getCurrentCredentials } from '../Auth';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

interface State {
  isOpen?: boolean;
  errorMessage?: string;
  successMessage?: string;
  userId?: string;
  userEmail?: string;
  enabled?: boolean;
  callback?: Function;
}
export class ToggleUserStatus extends React.Component<{}, State> {
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
   *   Get the user details
   */
  loadDetails(userId: string, enabled: boolean, userEmail: string, callback: Function) {
    if (userId) {
      this.setState({
        userId: userId,
        isOpen: true,
        enabled: enabled,
        userEmail: userEmail,
        callback: callback
      });
    } else {
      this.setState({ errorMessage: 'No user id', isOpen: true });
    }
  }
  /**
   * enable the user
   */
  enable = async (): Promise <void> => {
    try {
      await this.cognitoIdentityServiceProvider.adminEnableUser(
        {
          Username: this.state.userId,
          UserPoolId: config.cognito.USER_POOL_ID
        }
      ).promise();
      if (typeof this.state.callback === 'function') {
        this.state.callback();
      } else {
        this.setState({ isOpen: false});
      }
    } catch (e) {
      this.setState({ errorMessage:  `Something went wrong, please try again later. (${e.message})` });
    }
  }
  /**
   * disable the user
   */
  disable = async (): Promise <void> => {
    try {
      await this.cognitoIdentityServiceProvider.adminDisableUser(
        {
          Username: this.state.userId,
          UserPoolId: config.cognito.USER_POOL_ID
        }
      ).promise();
      if (typeof this.state.callback === 'function') {
        this.state.callback();
      } else {
        this.setState({ isOpen: false});
      }
    } catch (e) {
      this.setState({
        errorMessage: `Something went wrong, please try again later. (${e.message})`
      });
    }
  }
  toggleModal = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
      successMessage: undefined,
      errorMessage: undefined
    }));
  }
  /**
   * Hide the button if there's a message
   */
  buttons = () => {
    if (this.state.errorMessage || this.state.successMessage) {
      return <></>;
    } else {
      return (
        <>
          {this.state.enabled ? <Button color="danger" onClick={this.disable}>Disable</Button>
            : <Button color="danger" onClick={this.enable}>Enable</Button>}
        </>
       );
    }
  }

  render() {
    const hasError = (this.state.successMessage || this.state.errorMessage);

    return (
      <Modal isOpen={this.state.isOpen} toggle={this.toggleModal}>
        <ModalHeader>{this.state.enabled ? 'Disable ' : 'Enable '}?</ModalHeader>
        <ModalBody>
          {
            hasError ?
              <>
                {this.state.successMessage ? <Alert color="success">{this.state.successMessage}</Alert> : <></>}
                {this.state.errorMessage ? <Alert color="danger">{this.state.errorMessage}</Alert> : <></>}
              </>
              :
              <>{this.state.enabled ? 'Disable ' : 'Enable '}{this.state.userEmail ? this.state.userEmail : this.state.userId}?</>
          }
        </ModalBody>
        <ModalFooter>
          <this.buttons />
          <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
