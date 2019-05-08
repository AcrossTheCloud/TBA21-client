import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {
  Container,
  Alert,
  Button,
  Input,
  Spinner,
  Row,
  Col,
} from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync, FaPenAlt, FaKey } from 'react-icons/fa';

import EditUser from './editUser';
import { loadMore } from '../../../../actions/admin/people/manageUsers';
import AdminResetPassword from '../../../utils/user/AdminResetPassword';

import 'src/styles/pages/admin/people/manageUsers.scss';
import { SearchUsers } from './SearchUsers';

export interface Props {
  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;
  limit: number;
  // Functions
  loadMore: Function;
}

interface State {
  resetPasswordModalIsOpen: boolean;
  isLoading: boolean;
}

export interface User {
  email: string;
  username: string;
  enabled: boolean;
  status: string;
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
  columns;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: !this.props.users.length,
      resetPasswordModalIsOpen: false,
    };

    this.editUsersRef = React.createRef();
    this.resetUserPasswordRef = React.createRef();

    this.columns = [
      {
        dataField: 'username',
        hidden: true
      },
      {
        dataField: 'enabled',
        hidden: true
      },
      {
        dataField: 'status',
        hidden: true
      },
      {
        dataField: 'emailVerified',
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
              {row.enabled && row.emailVerified ? <FaKey onClick={() => this.resetUserPasswordRef.current.loadDetails(row.username, row.email)} /> : <></>}
            </span>
          );
        }
      }

    ];
  }
   rowStyle = (row) => {
    if (row.enabled) {
      return '';
    } else {
      return 'userDisabled';
    }
  }

  async componentDidMount() {
    // Load initial set of Users if we don't have any already.
    if (!this.props.users.length) {
      this.props.loadMore(this.props.limit);
    }
  }

  componentWillUpdate(): void {
    if (this.state.isLoading && this.props.users) {
      this.setState({ isLoading: false });
    }
  }

  render() {
    return (
      <Container id="manageUsers">
        <ErrorMessage message={this.props.errorMessage} />

        {/* START MODALS */}
        <EditUser ref={this.editUsersRef} />
        <AdminResetPassword ref={this.resetUserPasswordRef} />
        {/* END MODALS */}

        <div className="list">
          <Row>
            <Col xs="6" sm="2">
              <Input
                type="select"
                className="limit"
                name="limit"
                id="limit"
                value={this.props.limit}
                onChange={e => {
                  const
                    limit = e.target.value,
                    refreshUsers = (!this.props.paginationToken || !this.props.paginationToken.length);
                  this.setState({ isLoading: true });
                  this.props.loadMore(limit, this.props.paginationToken, refreshUsers);
                }}
              >
                <option>5</option>
                <option>15</option>
                <option>25</option>
                <option>50</option>
              </Input>
            </Col>

            <Col xs="6" sm={{size: 2, offset: 8}}>
              <Button color="secondary" className="float-right" onClick={() => { this.setState({ isLoading: true }); this.props.loadMore(this.props.limit, undefined, true); }}>
                <FaSync />
              </Button>
            </Col>
          </Row>

          <BootstrapTable
            bootstrap4
            className="userListTable"
            keyField="username"
            data={this.state.isLoading ? [] : this.props.users}
            columns={this.columns}
            rowClasses={this.rowStyle}
            onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
            noDataIndication={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
          />

          {
            this.props.paginationToken ?
              <Button
                block
                color="primary"
                size="lg"
                onClick={() => {
                  this.setState({ isLoading: true });
                  this.props.loadMore(this.props.limit, this.props.paginationToken);
                }}
              >
                Load More &nbsp; <FaSync />
              </Button> :
              <></>
          }
        </div>

        <SearchUsers limit={this.props.limit} />
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
