import * as React from 'react';
import { get, has } from 'lodash';
import { AWSError } from 'aws-sdk';
import CognitoIdentityServiceProvider, { ListUsersInGroupResponse, UserType, AttributeType } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {
  Button,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap';
import { FaSync } from 'react-icons/fa';

import config from 'dev-config';
import { getCurrentCredentials } from 'components/utils/Auth';

import { Gender, User, UserAttributes } from 'types/User';
import { Alerts, ErrorMessage } from '../../utils/alerts';
import { SearchUsers } from 'components/admin/user/SearchUsers';

import 'styles/components/admin/tables/modal.scss';

interface State extends Alerts {
  users: User[];
  paginationToken: string | undefined;

  tableIsLoading: boolean;
  componentModalOpen: boolean;
  rowEditingId: string | undefined;
}

export default class UserTable extends React.Component<{}, State> {
  _isMounted;
  tableColumns;
  searchInputRef;
  cognitoGroup = 'admin'; // todo-prod change this to the actual group.

  constructor(props: {}) {
    super(props);
    this._isMounted = false;

    this.searchInputRef = React.createRef();

    this.state = {
      componentModalOpen: false,
      tableIsLoading: true,
      rowEditingId: undefined,

      users: [],
      paginationToken: undefined,
    };

    this.tableColumns = [
      {
        dataField: 'username',
        hidden: true
      },
      {
        dataField: 'given_names',
        text: 'Given Name',
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            console.log(e, column, columnIndex, row, rowIndex);
          }
        }
      },
      {
        dataField: 'family_name',
        text: 'Family Name',
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            console.log(e, column, columnIndex, row, rowIndex);
          }
        }
      },
      {
        dataField: 'email',
        text: 'Email',
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            console.log(e, column, columnIndex, row, rowIndex);
          }
        }
      },
      {
        dataField: 'options',
        text: 'options',
        isDummyField: true,
        formatter: (e, row, rowIndex) => {
          return (
            <>
              <Button color="warning" size="sm" onClick={() => this.onEditButtonClick(row)}>Edit</Button>
            </>
          );
        }
      }
    ];
  }

  componentDidMount(): void {
    this._isMounted = true;

    this.listUsers();
  }
  componentWillUnmount(): void {
    this._isMounted = false;
  }

  onEditButtonClick = (row: User) => {
    this.setState(
{
        componentModalOpen: true,
        rowEditingId: row.username,
      }
    );
  }

  componentModalToggle = () => {
    this.setState( prevState => ({
      ...prevState,
      componentModalOpen: !prevState.componentModalOpen
      })
    );
  }

  /**
   * Load list of users from AWS Cognito
   * @param limit {number | undefined} Number of results to load
   */
  listUsers = async (limit: number = 15): Promise<void> => {
    type ListUsersState = {
      users: User[] | [],
      paginationToken: string | undefined,
      tableIsLoading: boolean,
      errorMessage: string | undefined
    };

    let listUsersState: ListUsersState = {
      users: [],
      tableIsLoading: false,
      paginationToken: undefined,
      errorMessage: undefined
    };

    try {
      const
        credentials = await getCurrentCredentials(),
        cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
          region: config.cognito.REGION,
          credentials: {
            accessKeyId: get(credentials, 'accessKeyId'),
            sessionToken: get(credentials, 'sessionToken'),
            secretAccessKey: get(credentials, 'data.Credentials.SecretKey'),
          }
        });

      let
        responsePaginationToken: string | undefined = undefined,
        params: CognitoIdentityServiceProvider.ListUsersInGroupRequest = {
          GroupName: this.cognitoGroup,
          UserPoolId: config.cognito.USER_POOL_ID,
          Limit: limit
        };

      // If we have a paginationToken add it to the Params.
      if (this.state.paginationToken) {
        Object.assign(params, { NextToken: this.state.paginationToken });
      }
      let data: ListUsersInGroupResponse | AWSError | undefined = await cognitoIdentityServiceProvider.listUsersInGroup(params).promise();

      if (data) {
        console.log('data', data);
        // If we have a token return it, otherwise we assume we're at the end of the list os our users.
        if (has(data, 'NextToken')) {
          responsePaginationToken = data.NextToken;
        }

        if (data.Users) {
          // Convert attributes to a key: value pair instead of an Array of Objects
          let users: User[] = data.Users.map( (user: UserType) => {

            // We don't know what we're potentially getting back from AWS, (Leave this indicator - USER-E1)
            let userAttributes: UserAttributes = {}; // tslint:disable-line: no-any
            if (user.Attributes) {
              user.Attributes.forEach( (attribute: AttributeType) => {
                if (typeof attribute.Value !== 'undefined') {
                  if (attribute.Name === 'email_verified') {
                    userAttributes[attribute.Name] = (attribute.Value === 'true');
                  } else if (attribute.Name === 'gender' && attribute.Value in Gender) {
                    userAttributes[attribute.Name] = Gender[attribute.Value];
                  } else {
                    userAttributes[attribute.Name] = attribute.Value;
                  }
                }
              });
            }

            // Disable the user if their status is unknown or COMPROMISED, because, who knows.
            if (user.UserStatus === 'UNKNOWN' || user.UserStatus === 'COMPROMISED') {
              user.Enabled = false;
            }

            return {
              username: user.Username,
              enabled: user.Enabled ? user.Enabled : false,
              status: user.UserStatus,

              email: userAttributes.email,
              emailVerified: userAttributes.email_verified,

              family_name: userAttributes.family_name,
              given_names: userAttributes.given_names,

              gender: userAttributes.gender,
              date_of_birth: userAttributes.date_of_birth,

              organisation: userAttributes.organisation,
              affiliation: userAttributes.affiliation,
              job_role: userAttributes.job_role,

              website: userAttributes.website,
              address: userAttributes.address
            };
          });

          listUsersState = {
            ...listUsersState,
            users: [...this.state.users, ...users],
            paginationToken: responsePaginationToken,
          };

        }
      } else {
        listUsersState.errorMessage = `Looks like there's no data to display`;
      }

      // Set our state
      if (this._isMounted) {
        this.setState({ ...listUsersState });
      }
    } catch (e) {
      console.log(e);
      if (this._isMounted) {
        this.setState({
          ...listUsersState,
          errorMessage: `We've had a bit of an issue with your request. (${e.message})`
        });
      }
    }
  }

  render() {
    return (
      <>
        <ErrorMessage message={this.state.errorMessage}/>
        <FormGroup className="PeopleTable">
          <BootstrapTable
            bootstrap4
            className="peopleTable"
            keyField="username"
            data={this.state.tableIsLoading ? [] : this.state.users}
            columns={this.tableColumns}
            onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
            noDataIndication={() => !this.state.tableIsLoading && !this.state.users.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
          />

          {
            this.state.paginationToken ?
              <Button  color="primary" size="lg" block onClick={() => this.listUsers()}>
                Load More &nbsp; <FaSync />
              </Button>
              : <></>
          }

          <SearchUsers limit={15} />

        </FormGroup>

        <Modal isOpen={this.state.componentModalOpen} className="tableModal fullwidth">
          <ModalBody>

            {/* USER DETAILS HERE */}

          </ModalBody>
          <ModalFooter>
            <Button className="mr-auto" color="secondary" onClick={this.componentModalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}
