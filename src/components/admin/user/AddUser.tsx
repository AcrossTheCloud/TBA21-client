import * as React from 'react';
import {
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Col,
  Container,
  Row, Form, FormGroup
} from 'reactstrap';
import { get, findIndex, clone } from 'lodash';
import { Alerts, ErrorMessage, WarningMessage } from '../../utils/alerts';
import { getCurrentCredentials } from '../../utils/Auth';
import config from '../../../config';
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import * as emailHelper from '../../utils/inputs/email';
import Select from 'react-select';
import { countries as selectableCountries } from '../../metadata/SelectOptions';
import { API } from 'aws-amplify';

import 'styles/components/admin/tables/modal.scss';

interface State extends Alerts {
  isOpen: boolean;
  groupsError?: string | undefined;
  userPoolId?: string;
  userEmail: string;
  userAttributes: GroupData[];
  groupsLoading: boolean;
  groups: GroupData[];
  cognitioGroups: GroupData[];
  validate: {
    emailField: boolean;
  };

  social_media?: string[];
  contributors?: string[];
  featured_image?: string;
  full_name?: string;
  field_expertise?: string;
  city?: string;
  country?: string;
  biography?: string;
  website?: string;
  public_profile?: boolean;
  profile_type?: string;
  affiliation?: string;
  position?: string;
  contact_person?: string;
  contact_position?: string;
  contact_email?: string;
}
interface GroupData {
  name: string;
}
const initialState: State = {
  isOpen: false,
  groupsLoading: false,
  userEmail: '',
  userAttributes: [],
  cognitioGroups: [],
  groups: [],
  successMessage: '',
  errorMessage: '',
  validate: {
    emailField: true
  },
};

export class AddUser extends React.Component<{}, State> {
  emailField;
  myFormRef;
  cognitoIdentityServiceProvider;
  userPoolId!: string;

  constructor(props: {}) {
    super(props);

    this.state = {
      isOpen: false,
      groupsLoading: false,
      userEmail: '',
      userAttributes: [],
      cognitioGroups: [],
      groups: [],
      validate: {
        emailField: true
      }
    };

    this.emailField = React.createRef();
    this.myFormRef = React.createRef();
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
   * Load the Cognitio groups and put them into state
   *
   */
  loadGroups = async (): Promise<void> => {
    let cognitioGroups: GroupData[] = [];

    const error = (message: string): void => {
      this.setState(
        {
          groupsError: message,
          groupsLoading: false
        });
    };

    // If we haven't loaded the pool groups (all the groups in Cognito) go get em.
    if (!this.state.cognitioGroups || !this.state.cognitioGroups.length) {
      const loadedCognitionGroups: GroupData[] | void = await this.getGroups();
      if (loadedCognitionGroups) {
        cognitioGroups = loadedCognitionGroups;
      }
    } else {
      cognitioGroups = this.state.cognitioGroups;
    }
    // If for whatever reason we can't load the groups throw an error up on the screen
    if (!cognitioGroups || !cognitioGroups.length) {
      error('Something wen\'t gone wrong getting the groups, please try again');
      return;
    }

    this.setState(() => ({
      groupsLoading: false,
      cognitioGroups: cognitioGroups
    }));
  }

  /**
   *
   * Gets all the groups from cognito and auto paginates if needed.
   *
   * @return {Promise<GroupData[]> {void}
   *
   */
  getGroups = async (nextToken?: string): Promise<GroupData[] | void> => {
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
    const emailValue = this.emailField.value;
    let { validate } = this.state;

    validate.emailField = emailHelper.validateEmail(emailValue);
    this.setState({ validate: validate });

  }

  /**
   * Adds a user to the user pool
   */
  addUser = async (): Promise<void> => {
    const profileAttributes = {};
    [
      'social_media',
      'contributors',
      'profile_image',
      'featured_image',
      'full_name',
      'field_expertise',
      'city',
      'country',
      'biography',
      'website',
      'public_profile',
      'affiliation',
      'position',
      'contact_person',
      'contact_position',
      'contact_email'
    ].forEach( attr => {
      if (!!this.state[attr]) {
        Object.assign(profileAttributes, { [attr]: this.state[attr] });
      }
    });

    const userEmail = this.emailField.value;
    if (userEmail.length) {
      try {
        const response = await this.cognitoIdentityServiceProvider.adminCreateUser(
          {
            Username: userEmail,
            UserPoolId: this.userPoolId,
            UserAttributes: []
          }
        ).promise();

        this.setState(
          {
            successMessage: 'User was successfully created',
            errorMessage: ''
          });

        if (profileAttributes) {
          await API.put('tba21', 'admin/profiles', {
            body: { ...profileAttributes, uuid: response.User.Username }
          });
        }

        this.addUserToGroup(response.User.Username);
      } catch (e) {
        this.setState(
          {
            errorMessage: `We had trouble adding this user, please try again. (${e.message})`,
          });
      }
    }
  }

  /**
   *
   * Adds the newly created user to the selected user pool
   *
   * @param userEmail
   *
   */
  addUserToGroup = async (userEmail: string): Promise<void> => {
    if (this.state.groups && this.state.groups.length) {

      this.state.groups.forEach( async (group: GroupData): Promise<void> => {
        try {
          await this.cognitoIdentityServiceProvider.adminAddUserToGroup(
            {
              GroupName: group.name,
              Username: userEmail,
              UserPoolId: this.userPoolId
            }
          ).promise();

        } catch (e) {
          this.setState({ errorMessage: `We had trouble adding the group ${group.name} from the user. (${e.message})`, });
        }
      });
    }
  }

  /**
   *
   * Gets all the cognito groups
   * Then outputs all the groups as FormGroups Checkboxes
   *
   * @returns {JSX.Element} Checkboxes and labels with the groups name etc.
   *
   */
  GroupsDisplay = (): JSX.Element => {
    const cognitioGroups = this.state.cognitioGroups;
    if (this.state.groupsError) {
      return <ErrorMessage message={this.state.groupsError}/>;
    }
    if (!cognitioGroups || (cognitioGroups && !cognitioGroups.length)) {
      return <ErrorMessage message="Unable to the list of load groups at this time."/>;
    }

    const groupElements: JSX.Element[] = cognitioGroups.map((group: GroupData, i) => {
      let enabled = false;

      return (
        <Col xs="6" md="3" key={i}>
          <Label for={'group_' + i} check>
            <Input
              type="checkbox"
              className={'group_' + i}
              onChange={e => this.groupInputOnChange(e, i)}
              value={enabled ? 'on' : 'off'}
            />{' '}{group.name}
          </Label>
        </Col>
      );
    });

    return <>{groupElements}</>;
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
      groups = [...this.state.groups] || [],
      modifiedGroup = clone(this.state.cognitioGroups[cognitioGroupsIndex]);

    const indexOf = findIndex(groups, { name: this.state.cognitioGroups[cognitioGroupsIndex].name });
    if (indexOf !== -1) {
      groups.splice(indexOf, 1);
    } else {
      Object.assign(modifiedGroup, { enabled: isChecked });
      groups.push(modifiedGroup);
    }
    this.setState({ groups: groups });
  }

  /**
   *  Toggles the open state for the AddUser Modal
   */
  addUserModalToggle = () => {
    this.loadGroups();
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
      successMessage: undefined,
      errorMessage: undefined
    }));
  }

  /**
   * Changes what buttons are displayed
   */
  buttons = (): JSX.Element => {
    if (!this.state.successMessage) {
      return (
        <>
          <Button color="primary" onClick={this.handleSubmit}>Submit</Button>,
          <Button color="secondary" onClick={this.addUserModalToggle}>Cancel</Button>
        </>
      );
    } else {
      return (
        <>
          <Button color="primary" onClick={this.addNewUser}>New User</Button>
          <Button color="secondary" onClick={this.addUserModalToggle}>Close</Button>
        </>
      );
    }
  }

  /**
   * Resetting the state and re-loading the groups without closing the modal
   */
  addNewUser = () => {
    this.setState({...initialState, isOpen: true});
    this.loadGroups();
    this.myFormRef.current.reset();
  }

  /**
   * Validates the input field and calls the addUser method if theyre valid
   */
  handleSubmit = () => {
    const emailValue = this.emailField.value;
    let { validate } = this.state;

    if (!this.state.full_name) {
      this.setState({ errorMessage: 'Need at least a full name to create a profile.'});
      return;
    }

    if (emailValue !== this.state.userEmail) {
      if (!this.validateEmail()) {
        validate.emailField = false;
        this.setState(
          {
            validate: validate,
            errorMessage: 'Please enter a valid email address.'
          });
        return;
      }
      this.addUser();
    }
  }

  fieldChanged = (value: string | string[], field: string) => {
    const state = {};
    if (value.length) {
      Object.assign(state, { [field]: value });
    }
    this.setState(state);
  }

  render() {
    return (
      <Modal isOpen={this.state.isOpen} backdrop className="fullwidth" scrollable toggle={this.addUserModalToggle}>
        <ModalHeader>
          Add User
        </ModalHeader>
        {this.state.errorMessage ? <ErrorMessage message={this.state.errorMessage} /> : <></>}
        {this.state.warningMessage ? <WarningMessage message={this.state.warningMessage} /> : <></>}
        {this.state.successMessage ? <Alert color="success"> {this.state.successMessage} </Alert> : <></>}
        <ModalBody>
          <Form innerRef={this.myFormRef}>
            <Label for="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              innerRef={e => this.emailField = e}
              onChange={this.onChangeValidateEmail}
              invalid={!this.state.validate.emailField}
            />
            <Container className="groups">
              <Row>
                <this.GroupsDisplay />
              </Row>
            </Container>

            <FormGroup>
              <Label for="full_name">Full Name</Label>
              <Input type="text" name="full_name" id="full_name" placeholder="Full Name" onChange={e => this.fieldChanged(e.target.value, 'full_name')} />
            </FormGroup>
            <FormGroup>
              <Label for="field_expertise">Field of Expertise</Label>
              <Input type="text" name="field_expertise" id="field_expertise" placeholder="Field of Expertise" onChange={e => this.fieldChanged(e.target.value, 'field_expertise')} />
            </FormGroup>
            <FormGroup>
              <Label for="city">City</Label>
              <Input type="text" name="city" id="city" placeholder="City" onChange={e => this.fieldChanged(e.target.value, 'city')} />
            </FormGroup>

            <FormGroup>
              <Label for="country">Country</Label>
              <Select className="select" classNamePrefix="select" isSearchable menuPlacement="auto" placeholder="Country" options={selectableCountries} />
            </FormGroup>

            <FormGroup>
              <Label for="biography">Biography</Label>
              <Input
                type="textarea"
                id="biography"
                onChange={e => this.fieldChanged(e.target.value, 'biography')}
              />
            </FormGroup>

            <FormGroup>
              <Label for="website">Website</Label>
              <Input type="text" name="website" id="website" placeholder="Website" onChange={e => this.fieldChanged(e.target.value, 'website')} />
            </FormGroup>

            <FormGroup>
              <Label for="affiliation">Affiliation</Label>
              <Input type="text" name="affiliation" id="affiliation" placeholder="Affiliation" onChange={e => this.fieldChanged(e.target.value, 'affiliation')} />
            </FormGroup>

            <FormGroup>
              <Label for="position">Position</Label>
              <Input type="text" name="position" id="position" placeholder="Position" onChange={e => this.fieldChanged(e.target.value, 'position')} />
            </FormGroup>

            <FormGroup>
              <Label for="type">Profile Type</Label>
              <Select
                className="select"
                classNamePrefix="select"
                id="type"
                menuPlacement="auto"
                options={[
                  {value: 'Institution', label: 'Institution'},
                  {value: 'Collective', label: 'Collective'},
                  {value: 'Individual', label: 'Individual'},
                  {value: 'Public', label: 'Normal User'}
                ]}
                defaultValue={{value: 'Public', label: 'Normal User'}}
                onChange={e => this.fieldChanged(e.value, 'profile_type')}
              />
            </FormGroup>

            {
              this.state.profile_type === 'Institution' || this.state.profile_type === 'Collective' ?
                <>
                  <FormGroup>
                    <Label for="contact_person">Contact Person</Label>
                    <Input type="text" name="contact_person" id="contact_person" placeholder="Contact Person" onChange={e => this.fieldChanged(e.target.value, 'contact_person')} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="contact_position">Contact Position</Label>
                    <Input type="text" name="contact_position" id="contact_position" placeholder="Contact Position" onChange={e => this.fieldChanged(e.target.value, 'contact_position')} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="contact_email">Contact Email</Label>
                    <Input type="text" name="contact_email" id="contact_email" placeholder="Contact Email" onChange={e => this.fieldChanged(e.target.value, 'contact_email')} />
                  </FormGroup>
                </>
                :
                <></>
            }

          </Form>
        </ModalBody>

        <ModalFooter>
          <this.buttons/>
        </ModalFooter>
      </Modal>
    );
  }
}
