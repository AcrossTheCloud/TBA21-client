import * as React from 'react';
import { has } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import { Alert, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync } from 'react-icons/fa';

import { checkAuth } from '../../../utils/Auth';
import { loadMore } from '../../../../actions/admin/people/manageUsers';

export interface Props {
  history?: any; // tslint:disable-line: no-any

  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;

  // Functions
  loadMore: Function;
}

export interface User {
  id: number;
  email: string;
  username: string;
}

const columns = [
{
  dataField: 'username',
  hidden: true
},
{
  dataField: 'email',
  text: 'User Email'
}];

class ManageUsers extends React.Component<Props, {}> { // put in header

  async componentDidMount() {
    const { authorisation, isAuthenticated } = await checkAuth();

    if (!isAuthenticated || authorisation && !has(authorisation, 'admin')) {
      this.props.history.push('/');
    }

    // List Users
    if (!this.props.users.length) {
      this.props.loadMore();
    }
  }

  render() {
    if (this.props.errorMessage) {
      return <Alert color="danger">{this.props.errorMessage}</Alert>;
    } else {
      return (
        <>
          <BootstrapTable keyField="username" data={this.props.users} columns={columns} />

          {
            this.props.paginationToken ?
              <Button  color="primary" size="lg" block onClick={() => this.props.loadMore(this.props.paginationToken)}>
                Load More &nbsp; <FaSync />
              </Button> :
              <></>
          }
        </>
      );
    }
  }
}

const mapStateToProps = (state: { manageUsers: Props }) => ({
  errorMessage: state.manageUsers.errorMessage,
  users: state.manageUsers.users,
  paginationToken: state.manageUsers.paginationToken
});

export default connect(mapStateToProps, { loadMore })(ManageUsers);
