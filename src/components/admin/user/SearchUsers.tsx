import * as React from 'react';
import { get } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle, Spinner,
} from 'reactstrap';

import { FaSync, FaPenAlt, FaKey } from 'react-icons/fa';

import EditUser from './EditUser';
import { UserList, listUsers } from 'actions/admin/user/manageUsers';
import AdminResetPassword from 'components/utils/user/AdminResetPassword';

import { User } from 'types/User';

import 'styles/components/admin/user/manageUsers.scss';
import { Alerts, ErrorMessage } from '../../utils/alerts';

interface Props {
  limit: number;
}

interface State extends Alerts {
  results: User[];
  searchBy: string;
  searchByLabel: string;
  paginationToken: string | undefined;
  resetPasswordModalIsOpen: boolean;
  isLoading: boolean;
}

export class SearchUsers extends React.Component<Props, State> {
  editUsersRef;
  resetUserPasswordRef;
  searchInputRef;
  columns;

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: undefined,
      results: [],
      searchBy: 'email',
      searchByLabel: 'Email',
      paginationToken: undefined,
      resetPasswordModalIsOpen: false,
      isLoading: false
    };

    this.searchInputRef = React.createRef();
    this.editUsersRef = React.createRef();
    this.resetUserPasswordRef = React.createRef();

    this.columns = [
      {
        dataField: 'username',
        hidden: true
      },
      {
        dataField: 'email',
        text: 'User Email'
      },
      {
        dataField: 'options',
        text: 'Options',
        isDummyField: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <span className="optionIcon">
              <FaPenAlt onClick={() => this.editUsersRef.current.loadUserDetails(row.username)}/>
              <FaKey onClick={() => this.resetUserPasswordRef.current.loadDetails(row.username, row.email)} />
            </span>
          );
        }
      }
    ];
  }

  /**
   * Sets the searchByOption in state to one of the supplied options, used in the listUsers userQuery filter.
   * @param event {React.MouseEvent}
   */
  searchByOption = (event: React.MouseEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;

    this.setState({
      searchBy: target.value,
      searchByLabel: target.innerText
    });
  }

  /**
   * Gets a list of users from a specific search query and puts it into state, concatenating the results.
   */
  searchUsersLoadMore = async (): Promise<void> => {
    this.setState({ isLoading: true });

    try {
      const
        userQuery = get(this.searchInputRef, 'current.value'),
        userQueryOption = this.state.searchBy,
        token = this.state.paginationToken,
        results: UserList = await listUsers(this.props.limit, token, userQuery, userQueryOption);

      if (results && results.users && results.users.length) {
        this.setState({
          isLoading: false,
          results:  [...this.state.results, ...results.users],
          paginationToken: results.paginationToken
        });
      } else {
        this.setState({
          isLoading: false,
          results:  [],
          paginationToken: undefined
        });
      }
    } catch (error) {
      this.setState({
        errorMessage: 'Please try again',
        results:  [],
        paginationToken: undefined,
        isLoading: false
      });
    }
  }

  /**
   * Gets a list of users from a specific search query and puts it into state from the specified userQuery
   * Also stores paginationToken
   */
  searchUsers = async (): Promise<void> => {
    const
      userQuery = get(this.searchInputRef, 'current.value'),
      userQueryOption = this.state.searchBy;

    if (userQuery) {
      this.setState({ isLoading: true });
      try {
        const results: UserList | null = await listUsers(this.props.limit, undefined, userQuery, userQueryOption);

        if (results && results.users && results.users.length ) {
          this.setState({
            isLoading: false,
            errorMessage: undefined,
            results: results.users,
            paginationToken: results.paginationToken
          });
        } else {
          this.setState({
            isLoading: false,
            results:  [],
            paginationToken: undefined,
          });
        }
      } catch (error) {
        this.setState({
          isLoading: false,
          errorMessage: 'Please try again',
          results: []
        });
      }
    }
  }

  render() {
    return (
      <div className="SearchUsers">

        {/* START MODALS */}
        <EditUser ref={this.editUsersRef} />
        <AdminResetPassword ref={this.resetUserPasswordRef} />
        {/* END MODALS */}

        <FormGroup name="search" className="search">
          <Label for="search">Search Users</Label>
          <InputGroup>
            <UncontrolledDropdown addonType="prepend" type="select" name="searchBy" id="searchBy">
              <DropdownToggle caret>{this.state.searchByLabel}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={this.searchByOption} value="email">Email</DropdownItem>
                <DropdownItem onClick={this.searchByOption} value="username">Username</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <Input type="text" name="search" id="search" placeholder="Search Users" innerRef={this.searchInputRef} />

            <InputGroupAddon addonType="append">
              <Button type="submit" onClick={this.searchUsers}>Search</Button>
            </InputGroupAddon>
          </InputGroup>

          <ErrorMessage message={this.state.errorMessage}/>
          {
            this.state.results.length ?
              <BootstrapTable
                bootstrap4
                keyField="username"
                data={this.state.isLoading ? [] : this.state.results}
                columns={this.columns}
                onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
                noDataIndication={() => !this.state.isLoading && !this.state.results.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
              />
              : <></>
          }
          {
            this.state.paginationToken ?
              <Button  color="primary" size="lg" block onClick={() => this.searchUsersLoadMore()}>
                Load More &nbsp; <FaSync />
              </Button>
              : <></>
          }
        </FormGroup>
      </div>
    );
  }
}
