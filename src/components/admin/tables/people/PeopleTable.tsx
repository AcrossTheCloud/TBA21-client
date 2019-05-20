import * as React from 'react';
import { get, has } from 'lodash';
import { AWSError } from 'aws-sdk';
import CognitoIdentityServiceProvider, { ListUsersInGroupResponse, UserType, AttributeType } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import config from 'config';
import { getCurrentCredentials } from 'components/utils/Auth';

import { User } from 'types/User';

import 'styles/components/admin/tables/modal.scss';

interface State {
  errorMessage: string | undefined;

  users: User[];
  paginationToken: string | undefined;

  tableIsLoading: boolean;
  componentModalOpen: boolean;
  rowEditingId: string | undefined;
}

export default class UserTable extends React.Component<{}, State> {
  tableColumns;

  constructor(props: {}) {
    super(props);

    this.state = {
      errorMessage: undefined,

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
    this.listUsers();
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
   * @param limit {number | null} Number of results to load
   * @param paginationToken {string | null} String returned from AWS API Call
   * @param userQuery filters search results
   * @param userQueryOption toggles the search result filter
   */
  listUsers = async (limit: number = 15, paginationToken: string | undefined = undefined, userQuery?: string, userQueryOption?: string): Promise<void> => {
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
                                                                            }),
        params: CognitoIdentityServiceProvider.ListUsersInGroupRequest = {
          GroupName: 'admin',
          UserPoolId: config.cognito.USER_POOL_ID,
          Limit: limit
        };

      if (userQuery) {
        Object.assign (params, {Filter:  `${userQueryOption} ^=  '${userQuery}'`} ); // AWS expects single quotes around the userQuery
      }

      let responsePaginationToken: string | undefined = undefined;

      // If we've passed a paginationToken add it to the Params.
      if (paginationToken) {
        Object.assign(params, {PaginationToken: paginationToken});
      }

      const data: ListUsersInGroupResponse | AWSError = await cognitoIdentityServiceProvider.listUsersInGroup(params).promise();

      if (data) {
        // If we have a token return it, otherwise we assume we're at the end of the list os our users.
        if (has(data, 'PaginationToken')) {
          responsePaginationToken = data.NextToken;
        }

        if (data.Users) {
          // Convert attributes to a key: value pair instead of an Array of Objects
          const users: User[] = data.Users.map((user: UserType) => {

            let userAttributes: {[Name: string]: string} = {};
            if (user.Attributes) {
              user.Attributes.forEach( (attribute: AttributeType) => {
                if (typeof attribute.Value !== 'undefined') {
                  userAttributes[attribute.Name] = attribute.Value;
                }
              });
            }

            // Disable the user if their status is unknown or COMPROMISED, because, who knows.
            if (user.UserStatus === 'UNKNOWN' || user.UserStatus === 'COMPROMISED') {
              user.Enabled = false;
            }

            return {
              username: user.Username ? user.Username : 'No Name',
              enabled: user.Enabled ? user.Enabled : false,
              status: user.UserStatus ? user.UserStatus : '',

              email: userAttributes.email ? userAttributes.email : 'No Email',
              emailVerified: userAttributes.email_verified === 'true',

              family_name: userAttributes.family_name ? userAttributes.family_name : undefined,
              given_names: userAttributes.given_names ? userAttributes.given_names : undefined,

              gender: userAttributes.gender ? userAttributes.gender : undefined,
              date_of_birth: userAttributes.date_of_birth ? userAttributes.date_of_birth : undefined,

              organisation: userAttributes.organisation ? userAttributes.organisation : undefined,
              affiliation: userAttributes.affiliation ? userAttributes.affiliation : undefined,
              job_role: userAttributes.job_role ? userAttributes.job_role : undefined,

              website: userAttributes.website ? userAttributes.website : undefined,
              address: userAttributes.address ? userAttributes.address : undefined

            };
          });

          this.setState({
            users: users,
            tableIsLoading: false,
            paginationToken: responsePaginationToken
          });
        } else {
          this.setState({
            users: [],
            paginationToken: undefined,
            tableIsLoading: false,
          });
        }
      } else {
        this.setState({
          users: [],
          paginationToken: undefined,
          tableIsLoading: false,
          errorMessage: `Looks like there's no data to display`
        });
      }
    } catch (e) {
      console.log(e);
      this.setState({
        users: [],
        tableIsLoading: false,
        paginationToken: undefined,
        errorMessage: `Looks like there's no data to display`
      });
    }
  }

  render() {
    return (
      <>
        <BootstrapTable
          bootstrap4
          className="peopleTable"
          keyField="username"
          data={this.state.tableIsLoading ? [] : this.state.users}
          columns={this.tableColumns}
          onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
          noDataIndication={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
        />

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
