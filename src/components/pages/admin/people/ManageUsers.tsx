import * as React from 'react';
import { has } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Container, Alert, Button, FormGroup, Input, Label, UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync } from 'react-icons/fa';

import { checkAuth } from '../../../utils/Auth';
import { loadMore } from '../../../../actions/admin/people/manageUsers';
import EditUser from './editUser';

export interface Props {
  history?: any; // tslint:disable-line: no-any

  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;
  limit: number;
  // Functions
  loadMore: Function;
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

class ManageUsers extends React.Component<Props, {}> {
  EditUsersRef;
  columns;

  constructor(props: Props) {
    super(props);

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
          </Input>
          <Label for="search">Search Users</Label>
          <Input type="text" name="search" id="search" placeholder="Search Users" />
          <Button>Search</Button>
        </FormGroup>
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
