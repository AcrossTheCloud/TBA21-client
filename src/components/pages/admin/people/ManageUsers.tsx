import * as React from 'react';
import { has, get } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Container, Alert, Button, FormGroup, Input, Label, UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync } from 'react-icons/fa';

import { checkAuth } from '../../../utils/Auth';
import EditUser from './editUser';
import { loadMore, UserList } from '../../../../actions/admin/people/manageUsers';
import { listUsers } from '../../../../actions/admin/people/manageUsers';

export interface Props {
  history?: any; // tslint:disable-line: no-any

  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;
  limit: number;
  // Functions
  loadMore: Function;
}

interface State {
    searchResult: User[];
    errorMessage: string;
    searchBy: string;
    searchByLabel: string;
    searchPaginationToken: string|undefined;
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
  EditUsersRef;
  columns;
  searchInputRef;

  constructor(props: Props) {
    super(props);
    this.state = {searchResult: [], errorMessage: '', searchBy: 'email', searchByLabel: 'Email', searchPaginationToken: ''};
    this.searchInputRef = React.createRef();
    this.searchUsers = this.searchUsers.bind(this);
    this.searchBy = this.searchBy.bind(this);
    this.EditUsersRef = React.createRef();

    this.columns =
      [
        {
          dataField: 'username',
          hidden: true
        },
        {
          dataField: 'email',
          text: 'User Email'
        },
        {
          dataField: 'edit',
          text: 'Edit User',
          events: {
            onClick: (e, column, columnIndex, row) => {
              this.EditUsersRef.current.loadUserDetails(row.username);
            },
          }
        }
      ]
    ;
  }

  async componentDidMount() {
    const { authorisation, isAuthenticated } = await checkAuth();

    if (!isAuthenticated || authorisation && !has(authorisation, 'admin')) {
      this.props.history.push('/');
    }

    // List Users
    if (!this.props.users.length) {
      this.props.loadMore(this.props.limit);
    }
    }

    searchBy(event: any) { // tslint:disable-line: no-any

        this.setState({
            searchBy: event.target.value,
            searchByLabel: event.target.innerText
        });
    }

    /**
     * Returns more search results under the initial searchUsers query
     */
    loadMoreUsers = async() => {
        try {
            const userQuery = get(this.searchInputRef, 'current.value');
            const userQueryToggle = this.state.searchBy;
            const token = this.state.searchPaginationToken;

            const searchResult: UserList | null = await listUsers(1, token, userQuery, userQueryToggle);
            if (searchResult && searchResult.users.length) {
                console.log(this.state.searchPaginationToken);
                this.setState({
                  searchResult:  [...this.state.searchResult, ...searchResult.users],
                  searchPaginationToken: searchResult.paginationToken
                });
            }
        } catch (error) {
            this.setState({errorMessage: 'Please try again'});
        }
    }
    /**
     * Returns search results from listUsers
     * userQuery sets the attribute value to search against
     * userQueryToggle toggles between attribute filters
     */
    searchUsers = async() => {
        const userQuery = get(this.searchInputRef, 'current.value');
        const userQueryToggle = this.state.searchBy;

        if (userQuery) {
            try {
                const searchResult: UserList | null = await listUsers(1, undefined, userQuery, userQueryToggle);
                const token = get(searchResult, 'paginationToken');
                if (searchResult && searchResult.users.length ) { // error handling
                    this.setState({
                      searchResult: searchResult.users,
                      errorMessage: '',
                      searchPaginationToken: token
                    });
                }
                if (!token) {
                    console.log('no token', token);
                    this.setState ({
                        searchPaginationToken: undefined
                });
                }
           } catch (error) {
                this.setState({
                  errorMessage: 'Please try again',
                  searchResult: []
                });
           }
        }
    }

  render() {
    return (
      <Container className="ManageUsers">
        <ErrorMessage message={this.props.errorMessage} />

        <EditUser ref={this.EditUsersRef} />

        <BootstrapTable bootstrap4 keyField="username" data={this.props.users} columns={this.columns} />

        {
          this.props.paginationToken ?
            <Button  color="primary" size="lg" block onClick={() => this.props.loadMore(this.props.limit, this.props.paginationToken)}>
              Load More &nbsp; <FaSync />
            </Button> :
            <></>
        }
        <FormGroup>
          <Input type="select" name="limit" id="limit" value={this.props.limit} onChange={e => this.props.loadMore(e.target.value, this.props.paginationToken)}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>15</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </Input>
          <Label for="search">Search Users</Label>
          <Input type="text" name="search" id="search" placeholder="Search Users" innerRef={this.searchInputRef} />
          <Button type="submit" onClick={this.searchUsers}>Search</Button>

            <UncontrolledDropdown type="select" name="searchBy" id="searchBy">
                <DropdownToggle caret>Search by {this.state.searchByLabel}</DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={this.searchBy} value="email">Email</DropdownItem>
                    <DropdownItem onClick={this.searchBy} value="username">Username</DropdownItem>
                </DropdownMenu>
            </UncontrolledDropdown>
            {
                this.state.searchPaginationToken ?
                    <Button  color="primary" size="lg" block onClick={() => this.loadMoreUsers()}>
                        Load More &nbsp; <FaSync />
                    </Button> :
                    <></>
            }

        </FormGroup>
          {
              this.state.errorMessage ?
                  <ErrorMessage message={this.state.errorMessage}/>
                  : <> </>
          }
          {
              this.state.searchResult.length ?
               <BootstrapTable bootstrap4 keyField="username" data={this.state.searchResult} columns={this.columns} />
          : <></>
          }

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
