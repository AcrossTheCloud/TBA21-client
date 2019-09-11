import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { RouteComponentProps, withRouter } from 'react-router';

import { Announcement } from 'types/Announcement';

import { Alerts, ErrorMessage, SuccessMessage } from 'components/utils/alerts';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';
import { AnnouncementEditor } from '../../../metadata/AnnouncementEditor';

interface State extends Alerts {
  announcements: Announcement[];
  editingIndex?: number;

  componentModalOpen: boolean;
  deleteModalOpen: boolean;

  tableIsLoading: boolean;
  page: number;
  sizePerPage: number;
  totalSize: number;

  deleteErrorMessage: string | JSX.Element | undefined;
}

class Announcements extends React.Component<RouteComponentProps, State> {
  _isMounted;
  tableColumns;
  isContributorPath;

  constructor(props: RouteComponentProps) {
    super(props);
    this._isMounted = false;

    this.isContributorPath = (this.props.location.pathname.match(/contributor/i));

    this.state = {
      componentModalOpen: false,
      deleteModalOpen: false,
      announcements: [],

      tableIsLoading: true,
      page: 1,
      sizePerPage: 15,
      totalSize: 0,
      deleteErrorMessage: undefined
    };

    this.tableColumns = [
      {
        dataField: 'id',
        hidden: true
      },
      {
        dataField: 'status',
        text: 'Status',
      },
      {
        dataField: 'title',
        text: 'Title',
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
              <Button color="warning" size="sm" onClick={() => this.onEditButtonClick(rowIndex)}>Edit</Button>
              <Button color="danger" size="sm" onClick={() => this.onDeleteButtonClick(rowIndex)}>Delete</Button>
            </>
          );
        }
      }
    ];
  }

  async componentDidMount() {
    this._isMounted = true;
    this.getAnnouncement();
  }

  getAnnouncementQuery = async (offset: number): Promise<{ announcements: Announcement[], totalSize: number } | void> => {
    try {
      const
        queryStringParameters = {
          offset: offset,
          limit: this.state.sizePerPage
        },
        response = await API.get('tba21', `${this.isContributorPath ? 'contributor' : 'admin'}/announcements`, { queryStringParameters: queryStringParameters });

      return {
        announcements: response.announcements,
        totalSize: response.announcements[0] && response.announcements[0].count ? parseInt(response.announcements[0].count, 0) : 0
      };

    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({announcements: [], errorMessage: `We've had some trouble getting the list of announcements.`, tableIsLoading: false});
    }
  }

  getAnnouncement = async (): Promise<void> => {
    try {
      const
        currentIndex = (this.state.page - 1) * this.state.sizePerPage,
        response = await this.getAnnouncementQuery(currentIndex);

      if (response) {
        const { announcements, totalSize } = response;

        if (!this._isMounted) { return; }
        this.setState(
          {
            announcements: announcements,
            tableIsLoading: false,
            totalSize: totalSize
          }
        );
      }
    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({announcements: [], errorMessage: `We've had some trouble getting the list of announcements.`, tableIsLoading: false});
    }
  }

  onEditButtonClick = (collectionIndex: number) => {
    if (!this._isMounted) { return; }
    this.setState(
      {
        componentModalOpen: true,
        editingIndex: collectionIndex,
      }
    );
  }
  onDeleteButtonClick = (collectionIndex: number) => {
    if (!this._isMounted) { return; }
    this.setState(
      {
        deleteModalOpen: true,
        editingIndex: collectionIndex,
      }
    );
  }

  componentModalToggle = () => {
    if (!this._isMounted) { return; }
    this.setState( prevState => ({
       ...prevState,
       componentModalOpen: !prevState.componentModalOpen
     })
    );
  }
  deleteModalToggle = () => {
    if (!this._isMounted) { return; }
    this.setState( prevState => ({
       ...prevState,
       deleteModalOpen: !prevState.deleteModalOpen,
       deleteErrorMessage: undefined,
       successMessage: undefined
     })
    );
  }
  deleteAnnouncement = async () => {
    const state = {
      deleteErrorMessage: undefined,
      successMessage: undefined
    };
    try {
      const announcementIndex: number | undefined = this.state.editingIndex;
      if (typeof announcementIndex !== 'undefined' && announcementIndex > -1) {

        await API.del('tba21', `${this.isContributorPath ? 'contributor' : 'admin'}/announcements`, {
          queryStringParameters: {
            id: this.state.announcements[announcementIndex].id
          }
        });
        this.getAnnouncement();
        Object.assign(state, {
          deleteModalOpen: false,
          successMessage: 'Announcement deleted'
        });
      } else {
        Object.assign(state, {
          deleteErrorMessage: 'This announcement may have already been deleted.',
          deleteModalOpen: false
        });
        this.getAnnouncement();
      }

    } catch (e) {
      Object.assign(state, {
        deleteErrorMessage: 'We had some trouble deleting this announcement. Please try again later.'
      });
    } finally {
      if (this._isMounted) {
        this.setState(state);
      }
    }
  }

  handleTableChange = async (type, { page, sizePerPage }): Promise<void> => {
    if (type === 'pagination') {
      const currentIndex = (page - 1) * sizePerPage;
      if (!this._isMounted) { return; }
      this.setState({ tableIsLoading: true });

      try {
        const response = await this.getAnnouncementQuery(currentIndex);
        if (response) {
          if (!this._isMounted) { return; }

          this.setState({
            errorMessage: undefined,
            page,
            sizePerPage,
            announcements: response.announcements,
            tableIsLoading: false
          });
        }

      } catch (e) {
        if (!this._isMounted) { return; }
        this.setState({page: this.state.page - 1, errorMessage: `We've had some trouble getting your list of announcements.`, tableIsLoading: false});
      }
    }
  }

  render() {
    const
      { page, sizePerPage, totalSize } = this.state,
      announcements = this.state.announcements,
      currentIndex = (page - 1) * sizePerPage,
      slicedItems = announcements.length ? announcements.slice(currentIndex, currentIndex + sizePerPage) : [];

    return (
      <Container>
        <ErrorMessage message={this.state.errorMessage}/>
        <SuccessMessage message={this.state.successMessage}/>
        <BootstrapTable
          remote
          bootstrap4
          className="announcementTable"
          keyField="id"
          data={this.state.tableIsLoading ? [] : announcements}
          columns={this.tableColumns}
          pagination={paginationFactory({ page, sizePerPage, totalSize })}
          onTableChange={this.handleTableChange}
          noDataIndication={() => !this.state.tableIsLoading && !slicedItems.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
        />

        <Modal isOpen={this.state.componentModalOpen} className="tableModal fullwidth">
          <ModalBody>
            {typeof this.state.editingIndex !== 'undefined' && this.state.editingIndex >= 0 ?
              <AnnouncementEditor editMode={true} path={this.props.location.pathname} announcement={this.state.announcements[this.state.editingIndex]}/>
              : <></>
            }
          </ModalBody>
          <ModalFooter>
            <Button className="mr-auto" color="secondary" onClick={this.componentModalToggle}>Close</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.deleteModalOpen} className="tableModal">
          <ErrorMessage message={this.state.deleteErrorMessage}/>
          <ModalHeader>Delete Announcement?</ModalHeader>
          <ModalBody>Are you 100% sure you want to delete this announcement?</ModalBody>
          <ModalFooter>
            <Button color="danger" className="mr-auto" onClick={this.deleteAnnouncement}>I'm Sure</Button>{' '}
            <Button color="secondary" onClick={this.deleteModalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

export default withRouter(Announcements);
