import * as React from 'react';
import {
  Row,
  Container,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Input,
  Alert
} from 'reactstrap';
import { get, find, findIndex, clone } from 'lodash';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';

import config from '../../../../config';
import * as emailHelper from '../../../utils/inputs/email';
import { getCurrentCredentials } from '../../../utils/Auth';
import AdminResetPassword from  '../../../utils/user/AdminResetPassword';

interface State {
  isOpen: boolean;
  deleteUserModalIsOpen: boolean;
  resetPasswordModalIsOpen: boolean;
  groupsLoading: boolean;

  successMessage?: string| undefined;
  errorMessage?: string | undefined;
  groupsError?: string | undefined;

  userId?: string | undefined;
  userEmail?: string | undefined;
  changedUserEmail?: string | undefined;
  emailVerified?: string | undefined;
  status?: string | undefined;
  enabled?: string | undefined;

  cognitioGroups: GroupData[];
  userGroups: GroupData[];
  changedGroups: GroupData[];

  // Form states
  validate: {
    emailField: boolean;
  };
}
interface GroupData {
  name: string;
  description: string;
  enabled: boolean;
}
interface UserAttribute {
  Name: string;
  Value: string;
}

// Our initial state, we set the state back to the initial in some cases
// Such as when we close and load a new user, we don't want the old users groups etc.
const initialState = {
  isOpen: false,
  deleteUserModalIsOpen: false,
  errorMessage: undefined,
  groupsError: undefined,

  userId: undefined,
  userEmail: undefined,
  changedUserEmail: undefined,

  // cognitioGroups: [], we want to keep these loaded.
  userGroups: [],
  changedGroups: [],
  groupsLoading: true,

  validate: {
    emailField: true
  },
};

export default class EditUser extends React.Component<{}, State> {
  emailField;
  resetUserPasswordRef;
  cognitoIdentityServiceProvider;
  userPoolId: string;

  constructor(props: {}) {
    super(props);

    this.emailField = React.createRef();
    this.resetUserPasswordRef = React.createRef();

    this.state = {
      isOpen: false,
      deleteUserModalIsOpen: false,
      resetPasswordModalIsOpen: false,
      groupsLoading: false,
      cognitioGroups: [],
      userGroups: [],
      changedGroups: [],
      validate: {
        emailField: true
      },
    };
  }

  async componentDidMount(): Promise<void> {
    const credentials = await getCurrentCredentials();

    // Initialise CognitoIdentityServiceProvider so we can access it in our class.
    this.cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
      region: config.cognito.REGION,
      credentials: {
        accessKeyId: get(credentials, 'accessKeyId'),
        sessionToken: get(credentials, 'sessionToken'),
        secretAccessKey: get(credentials, 'data.Credentials.SecretKey'),
      }
    });

    this.userPoolId = config.cognito.USER_POOL_ID;
  }

  /**
   *
   * Loads the users details into the Modal form fields and opens the modal
   *
   * Catches any errors and opens the modal showing the error message with no form.
   *
   * @param userId {string} the user's id from AWS Cognito
   */
  loadUserDetails = async (userId: string): Promise<void> => {
    try {
      const userDetails = await this.cognitoIdentityServiceProvider.adminGetUser(
        {
          Username: userId,
          UserPoolId: this.userPoolId,

          // get the goods
        }
      ).promise();
      // if it's the same userId we're more than likely reloading the details after changing
      // AWS takes awhile to update groups, so we timeout here.
      if (this.state.userId === userId) {
        // Async load the users group groups.
        setTimeout( async () => { this.loadGroups(userId); }, 2000);
      } else {
        // Async load the users group groups.
        this.loadGroups(userId);
      }
      // Loop each attribute and add them to an a Key: Value pair so we can easily access them.
      let userAttributes: { [key: string]: string} = {}; // tslint:disable-line: no-any
      if (userDetails.UserAttributes) {
        userDetails.UserAttributes.forEach((attribute: UserAttribute) => {
          userAttributes[attribute.Name] = attribute.Value;
        });
      }
      this.setState({
        isOpen: true,
        userId: userId,
        userEmail: userAttributes.email,
        groupsLoading: true,
        emailVerified: userAttributes.email_verified,
        status: userDetails.UserStatus,
        enabled: userDetails.Enabled
      });
    } catch (e) {
      this.setState({ ...initialState, isOpen: true, errorMessage: e.message });
    }
  }

  /**
   * Checks fields are valid then updates the users attributes and groups.
   * Once finished it reloads the modal with the details.
   */
  submitChanges = async () => {
    if (typeof this.state.userId === 'undefined') {
      this.setState({
        errorMessage: 'Please close the window and re-open, looks like we\'ve lost the user\'s details.',
      });
      return;
    }

    let
      attributesToChange: UserAttribute[] = [],
      { validate } = this.state;

    const emailValue = this.emailField.value;

    if (emailValue !== this.state.userEmail) {
      if (!this.validateEmail()) {
        validate.emailField = false;
        this.setState({validate: validate});
        return;
      } else {
        attributesToChange.push( {Name: 'email', Value: emailValue} );
      }
    }

    await this.updateUserAttributes(attributesToChange);
    await this.updateUserGroups();

    // Reload the modal with the updated user details.
    this.setState({ ...initialState, userId: this.state.userId });
    this.loadUserDetails(this.state.userId);
  }

  /**
   * Add or remove a group from a user in Cognition based off the enabled flag for each item in State ChangedGroups
   */
  updateUserGroups = async (): Promise<void> => {
    if (this.state.changedGroups && this.state.changedGroups.length) {
      const removeGroup = async (groupName: string): Promise<void> => {
        try {
          await this.cognitoIdentityServiceProvider.adminRemoveUserFromGroup(
            {
              GroupName: groupName,
              Username: this.state.userId,
              UserPoolId: this.userPoolId
            }
          ).promise();

        } catch (e) {
          this.setState({
            errorMessage: `We had trouble removing the group ${groupName} from the user. (${e.message})`,
          });
        }
      };
      const addGroup = async (groupName: string): Promise<void> => {
        try {
          await this.cognitoIdentityServiceProvider.adminAddUserToGroup(
            {
              GroupName: groupName,
              Username: this.state.userId,
              UserPoolId: this.userPoolId
            }
          ).promise();

        } catch (e) {
          this.setState({
            errorMessage: `We had trouble adding the group ${groupName} from the user. (${e.message})`,
          });
        }
      };

      this.state.changedGroups.forEach( async (group: GroupData): Promise<void> => {
        if (group.enabled) {
          await addGroup(group.name);
        } else {
          await removeGroup(group.name);
        }
      });
    }
  }
  /**
   * Updates the users attributes.
   *
   * @param userAttributes {Array} {Name, Value} key pair.
   */
  updateUserAttributes = async (userAttributes: UserAttribute[]): Promise<void> => {
    if (userAttributes.length) {
      try {
        await this.cognitoIdentityServiceProvider.adminUpdateUserAttributes(
          {
            UserAttributes: userAttributes,
            Username: this.state.userId,
            UserPoolId: this.userPoolId
          }
        ).promise();

      } catch (e) {
        this.setState({
          errorMessage: `We had trouble updating the users attributes, please try again. (${e.message})`,
        });
      }
    }
  }

  /**
   * Validate the email field.
   *
   * @returns {boolean} is the email valid or not.
   */
  validateEmail = (): boolean => {
    return emailHelper.validateEmail(this.emailField.value);
  }
  /**
   * Sets the validation of email field in the state
   */
  onChangeValidateEmail = (): void => {
    const
      emailValue = this.emailField.value;
    let
      { validate } = this.state;

    validate.emailField = emailHelper.validateEmail(emailValue);
    this.setState({ validate: validate });
  }

  /**
   * Toggles the open state for the deleteUser Modal
   */
  deleteUserModalToggle = () => {
    this.setState(prevState => ({
      deleteUserModalIsOpen: !prevState.deleteUserModalIsOpen
    }));
  }

  /**
   * Deletes the user and closes all modals.
   */
  deleteUser = async (): Promise<void> => {
    try {
      await this.cognitoIdentityServiceProvider.adminDeleteUser(
        {
          Username: this.state.userId,
          UserPoolId: this.userPoolId
        }
      ).promise();

      this.setState({
        isOpen: false,
        ...initialState // Wipe the state
      });
    } catch (e) {
      this.setState({
        errorMessage: 'Had some trouble deleting this user. Please try again later.',
        deleteUserModalIsOpen: false
      });
    }
  }

  /**
   *
   * Compares the usersgroups and cognitiogroups and set the enabled param to true if they exist in both
   * Then outputs all the groups as FormGroups Checkboxes
   *
   * @returns {JSX.Element} Checkboxes and labels with the groups name etc.
   */
  GroupsDisplay = (): JSX.Element => {
    const
      cognitioGroups = this.state.cognitioGroups,
      userGroups = this.state.userGroups;

    if (this.state.groupsLoading) {
      return <>Loading User Groups</>;
    }
    if (this.state.groupsError) {
      return <Alert color="danger">{this.state.groupsError}</Alert>;
    }
    if (!cognitioGroups || cognitioGroups && !cognitioGroups.length || typeof userGroups === 'undefined') {
      return <Alert color="danger">Unable to the list of load groups at this time.</Alert>;
    }

    const groupElements: JSX.Element[] = cognitioGroups.map((group: GroupData, i) => {
      let enabled = false;
      // Find the User's groups and set the corresponding CognitionGroup enabled param to true.
      if (find(userGroups, {name: group.name})) {
        enabled = true;
      }
      return (
        <Col xs="6" md="3" key={i}>
          <Label for={'group_' + i} check>
            <Input type="checkbox" onChange={e => this.groupInputOnChange(e, i)} className={'group_' + i} value={enabled ? 'on' : 'off'} defaultChecked={enabled} />{' '}{group.name}
          </Label>
        </Col>
      );
    });

    return <>{groupElements}</>;
  }
  /**
   *
   * Load the Cognitio groups and Users groups and put them into state
   *
   */
  loadGroups = async (userId: string): Promise<void> => {
    let
      cognitioGroups: GroupData[] = [];

    const error = (message: string): void => {
      this.setState({
        groupsError: message,
        groupsLoading: false
      });
    };

    // If we haven't loaded the cognitogroups (all the groups in Cognito) go get em.
    if (!this.state.cognitioGroups || !this.state.cognitioGroups.length) {
      const loadedCognitionGroups: GroupData[] | void = await this.getGroups();
      if (loadedCognitionGroups) {
        cognitioGroups = loadedCognitionGroups;
      }
    } else {
      cognitioGroups = this.state.cognitioGroups;
    }
    // If for whatever reason we can't load the cognito groups throw an error up on the screen
    if (!cognitioGroups || !cognitioGroups.length) {
      error('Something wen\'t gone wrong getting the groups, please try again');
      return;
    }

    // If for whatever reason we can't load the USERS groups throw an error up on the screen
    const userGroups: GroupData[] | void = await this.getUserGroups(userId);
    if (!userGroups) {
      error('Something wen\'t gone wrong when getting the groups for this user, please try again');
      return;
    }

    this.setState(prevState => ({
      userEmail: prevState.userEmail,
      groupsLoading: false,
      cognitioGroups: cognitioGroups,
      userGroups: userGroups,
    }));
  }
  /**
   *
   * Gets all the groups from cognito and auto paginates if needed.
   *
   * @return {Promise<GroupData[]> {void}
   */
  getGroups = async (nextToken?: string): Promise<GroupData[] | void> => {
    // https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListGroups.html
    let params = {
        UserPoolId: this.userPoolId,
        Limit: 60
      },
      groups: GroupData[] = [];

    // Set the token in the params if we have one.
    if (nextToken !== undefined) {
      Object.assign(params, { NextToken: nextToken });
    }

    try {
      const cognitioGroups = await this.cognitoIdentityServiceProvider.listGroups(params).promise();

      cognitioGroups.Groups.forEach( (group) => {
        groups.push(
          {
            name: group.GroupName,
            description: group.Description,
            enabled: false
          }
        );
      });

      // Loop this function if we get a Pagination Token.
      if (cognitioGroups.NextToken && cognitioGroups.NextToken.length) {
        try {
          const loadMoreGroups: GroupData[] | void = await this.getGroups(cognitioGroups.NextToken);
          if (loadMoreGroups) {
            groups.push(...loadMoreGroups);
          }
        } catch (e) {
          this.setState({errorMessage: e.message});
        }
      }

      return groups;
    } catch (e) {
      this.setState({errorMessage: e.message});
    }
  }
  /**
   *
   * Gets all the USER'S groups from cognito and auto paginates if needed.
   *
   * @return {Promise<GroupData[]> {void}
   */
  getUserGroups = async (userId: string, nextToken?: string): Promise<GroupData[] | void> => {
    // https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminListGroupsForUser.html
    let params = {
        Username: userId,
        UserPoolId: this.userPoolId,
        Limit: 60
      },
      groups: GroupData[] = [];

    if (nextToken !== undefined) {
      Object.assign(params, { NextToken: nextToken });
    }

    try {
      const usersGroups = await this.cognitoIdentityServiceProvider.adminListGroupsForUser(params).promise();

      usersGroups.Groups.forEach( (group, index) => {
        groups.push(
          {
            name: group.GroupName,
            description: group.Description,
            enabled: true
          }
        );
      });

      if (usersGroups.NextToken && usersGroups.NextToken.length) {
        try {
          const loadMoreGroups: GroupData[] | void = await this.getUserGroups(userId, usersGroups.NextToken);
          if (loadMoreGroups) {
            groups.push(...loadMoreGroups);
          }
        } catch (e) {
          this.setState({errorMessage: e.message});
        }
      }

      return groups;

    } catch (e) {
      // throw { message: e.message };
      this.setState({errorMessage: e.message});
    }
  }
  /**
   *
   * Detects if a group checkbox has been changed and stores it so we can save the users attributes late.
   *
   * On groupCheckbox change add it to state
   * Otherwise remove it
   *
   */
  groupInputOnChange = (element, cognitioGroupsIndex): void => {
    const isChecked: boolean = element.target.checked;

    let
      groups = [...this.state.changedGroups] || [],
      modifiedGroup = clone(this.state.cognitioGroups[cognitioGroupsIndex]);

    const indexOf = findIndex(groups, { name: this.state.cognitioGroups[cognitioGroupsIndex].name });
    if (indexOf !== -1) {
      groups.splice(indexOf, 1);
    } else {
      Object.assign(modifiedGroup, { enabled: isChecked });
      groups.push(modifiedGroup);
    }
    this.setState({ changedGroups: groups });
  }

  /**
   *
   * Toggles the modal state to open or closed.
   * Also resets the state back to initialState as we don't want a previous users details.
   *
   */
  toggle = (): void => {
    let closedState = {};
    // On close, wipe the state.
    if (this.state.isOpen) {
      closedState = {...initialState};
    }

    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
      ...closedState
    }));
  }

  render() {
    // Change and Delete buttons
    const Buttons = (): JSX.Element => {
      if (this.state.userId) {
        return (
          <>
            <Button color="danger" className="mr-auto" onClick={this.deleteUserModalToggle}>DELETE USER</Button>{' '}
            {this.state.emailVerified === 'true' ? <Button color="primary" onClick={() => this.resetUserPasswordRef.current.loadDetails(this.state.userId, this.state.userEmail)}>Reset Password</Button> : <></>}
            <Button color="primary" onClick={this.submitChanges}>Change User</Button>{' '}
          </>
        );
      } else {
        return <></>;
      }
    };

    return (
      <Modal isOpen={this.state.isOpen} toggle={this.toggle} size="lg" className="EditUser" backdrop={true}>
        <ModalHeader toggle={this.toggle}>Editing {this.state.userEmail ? this.state.userEmail : this.state.userId}</ModalHeader>

        <ModalBody>
          {this.state.errorMessage ? <Alert color="danger">{this.state.errorMessage}</Alert> : <></>}
          {this.state.successMessage ? <Alert color="success">{this.state.successMessage}</Alert> : <></>}
          {
            this.state.userId ?
              <Form onSubmit={e => { e.preventDefault(); }} autoComplete="off">
                <FormGroup name="userDetails">
                  <Label for="email">Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    defaultValue={this.state.changedUserEmail ? this.state.changedUserEmail : this.state.userEmail}
                    innerRef={e => this.emailField = e}
                    onChange={this.onChangeValidateEmail}
                    invalid={!this.state.validate.emailField}
                  />
                  <FormFeedback>You haven't entered a valid email address</FormFeedback>
                </FormGroup>

                <Container className="groups">
                  <Row>
                    <this.GroupsDisplay />
                  </Row>
                </Container>

                {/* Delete user modal */}
                <Modal isOpen={this.state.deleteUserModalIsOpen} toggle={this.deleteUserModalToggle}>
                  <ModalHeader>Delete User</ModalHeader>
                  <ModalBody>Are you 100% sure you want to delete this user?</ModalBody>
                  <ModalFooter>
                    <Button color="danger" className="mr-auto" onClick={this.deleteUser}>I'm Sure</Button>{' '}
                    <Button color="secondary" onClick={this.deleteUserModalToggle}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                <AdminResetPassword ref={this.resetUserPasswordRef} />
              </Form>
            : <></>
          }
        </ModalBody>
        <ModalFooter>
          <Buttons />
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
