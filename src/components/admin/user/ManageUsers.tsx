import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {
  Container,
  Button,
  Input,
  Spinner,
  Row,
  Col,
  UncontrolledPopover,
  PopoverBody
} from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync, FaPenAlt, FaKey, FaUserPlus } from 'react-icons/fa';

import EditUser from './EditUser';
import { loadMore } from 'actions/admin/user/manageUsers';
import AdminResetPassword from 'components/utils/user/AdminResetPassword';
import { SearchUsers } from './SearchUsers';

import { User } from 'types/User';
import { ErrorMessage } from '../../utils/alerts';

import 'styles/components/admin/user/manageUsers.scss';
import { AddUser } from './AddUser';

export interface Props {
  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;
  limit: number;
  // Functions
  loadMore: Function;
}

interface State {
  isLoading: boolean;
}

class ManageUsers extends React.Component<Props, State> {
  editUsersRef;
  resetUserPasswordRef;
  addUserRef;
  columns;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: !this.props.users.length
    };

    this.editUsersRef = React.createRef();
    this.resetUserPasswordRef = React.createRef();
    this.addUserRef = React.createRef();
    const style = { overflowWrap: 'break-word', wordWrap: 'break-word'  } ;
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
        text: 'User Email',
        style: () => {
          return style;
        },
      },
      {
        dataField: 'options',
        text: 'Options',
        isDummyField: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <span className="optionIcon">
              <FaPenAlt id={`editUser-${rowIndex}`} onClick={() => this.editUsersRef.current.loadUserDetails(row.username)}/>
              <UncontrolledPopover trigger="hover" placement="bottom" target={`editUser-${rowIndex}`}><PopoverBody>Edit user.</PopoverBody></UncontrolledPopover>
              {
                row.enabled && row.emailVerified && row.status !== 'RESET_REQUIRED' ?
                  <>
                    <FaKey id={`resetPassword-${rowIndex}`} onClick={() => this.resetUserPasswordRef.current.loadDetails(row.username, row.email)} />
                    <UncontrolledPopover trigger="hover" placement="bottom" target={`resetPassword-${rowIndex}`}><PopoverBody>Reset Password.</PopoverBody></UncontrolledPopover>
                  </>
                  :
                  <></>
              }
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

  componentDidUpdate(): void {
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
        <AddUser ref={this.addUserRef} />
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
            <Col xs="6" sm={{size: 2, offset: 8}} className="py-2">
              <Button color="secondary" className="float-right" onClick={() => { this.setState({ isLoading: true }); this.props.loadMore(this.props.limit, undefined, true); }}>
                <FaSync />
              </Button>
              <Button color="secondary" className="float-right mr-2" onClick={() => this.addUserRef.current.addUserModalToggle()} >
                <FaUserPlus />
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
            noDataIndication={() => !this.state.isLoading && !this.props.users.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
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
