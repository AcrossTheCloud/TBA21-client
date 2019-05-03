import * as React from 'react';
import { get } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {
  Container,
  Alert,
  Button,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync, FaPenAlt, FaKey } from 'react-icons/fa';

import EditUser from './editUser';
import { loadMore, UserList } from '../../../../actions/admin/people/manageUsers';
import { listUsers } from '../../../../actions/admin/people/manageUsers';
import AdminResetPassword from '../../../utils/user/AdminResetPassword';

import 'src/styles/pages/admin/people/manageUsers.scss';

export interface Props {
  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;
  limit: number;
  // Functions
  loadMore: Function;
}

interface State {
  searchResults: User[];
  searchErrorMessage: string | undefined;
  searchBy: string;
  searchByLabel: string;
  searchPaginationToken: string | undefined;
  resetPasswordModalIsOpen: boolean;
}

export interface User {
  email: string;
  username: string;
}

const ErrorMessage = (props: {message: string | undefined}) => {
  if (props.message === undefined) {
    return <></>;
  } else {
    return <Alert color="danger">{props.message}</Alert>;
  }
};

class ManageUsers extends React.Component<Props, State> {
  editUsersRef;
  resetUserPasswordRef;
  searchInputRef;
  columns;

  constructor(props: Props) {
    super(props);
    this.state = {
      searchResults: [],
      searchErrorMessage: undefined,
      searchBy: 'email',
      searchByLabel: 'Email',
      searchPaginationToken: undefined,
      resetPasswordModalIsOpen: false
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
              <FaKey onClick={() => this.resetUserPasswordRef.current.loadDetails(row.username)} />
            </span>
          );
        }
      }
    ];
  }
  resetPassword = () => {
    this.setState({
      resetPasswordModalIsOpen: true
                  });
  }
  async componentDidMount() {
    // Load initial set of Users if we don't have any already.
    if (!this.props.users.length) {
      this.props.loadMore(this.props.limit);
    }
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
    try {
      const
        userQuery = get(this.searchInputRef, 'current.value'),
        userQueryOption = this.state.searchBy,
        token = this.state.searchPaginationToken,
        searchResults: UserList | null = await listUsers(this.props.limit, token, userQuery, userQueryOption);

      if (searchResults && searchResults.users && searchResults.users.length) {
        this.setState({
          searchResults:  [...this.state.searchResults, ...searchResults.users],
          searchPaginationToken: searchResults.paginationToken
        });
      }
    } catch (error) {
      this.setState({searchErrorMessage: 'Please try again'});
    }
  }

  /**
   * Gets a list of users from a specific search query and puts it into state from the specified userQuery
   * Also stores searchPaginationToken
   */
  searchUsers = async (): Promise<void> => {
    const
      userQuery = get(this.searchInputRef, 'current.value'),
      userQueryOption = this.state.searchBy;

    if (userQuery) {
      try {
        const searchResults: UserList | null = await listUsers(this.props.limit, undefined, userQuery, userQueryOption);

        if (searchResults && searchResults.users && searchResults.users.length ) {
          this.setState({
            searchErrorMessage: undefined,
            searchResults: searchResults.users,
            searchPaginationToken: searchResults.paginationToken
          });
        }
      } catch (error) {
        this.setState({
          searchErrorMessage: 'Please try again',
          searchResults: []
        });
      }
    }
  }

  render() {
    return (
      <Container id="manageUsers">
        <ErrorMessage message={this.props.errorMessage} />

        <EditUser ref={this.editUsersRef} />

        <div className="list">
          <Input type="select" className="limit" name="limit" id="limit" value={this.props.limit} onChange={e => this.props.loadMore(e.target.value, this.props.paginationToken)}>
            <option>15</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </Input>
          <BootstrapTable bootstrap4 className="userListTable" keyField="username" data={this.props.users} columns={this.columns} />
          {
            this.props.paginationToken ?
              <Button  color="primary" size="lg" block onClick={() => this.props.loadMore(this.props.limit, this.props.paginationToken)}>
                Load More &nbsp; <FaSync />
              </Button> :
              <></>
          }
        </div>

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

          {
            this.state.searchErrorMessage ?
              <ErrorMessage message={this.state.searchErrorMessage}/>
              : <> </>
          }
          {
            this.state.searchResults.length ?
              <BootstrapTable bootstrap4 keyField="username" data={this.state.searchResults} columns={this.columns} />
              : <></>
          }
          {
            this.state.searchPaginationToken ?
              <Button  color="primary" size="lg" block onClick={() => this.searchUsersLoadMore()}>
                Load More &nbsp; <FaSync />
              </Button>
              : <></>
          }
        </FormGroup>
        <AdminResetPassword ref={this.resetUserPasswordRef} />
      </Container>
    );
  }
}

const mapStateToProps = (state: { manageUsers: Props }) => ({
  errorMessage: state.manageUsers.errorMessage,
  users: state.manageUsers.users,
  paginationToken: state.manageUsers.paginationToken,
  limit: state.manageUsers.limit
});

export default connect(mapStateToProps, { loadMore })(ManageUsers);
