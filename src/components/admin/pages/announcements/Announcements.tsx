import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { RouteComponentProps, withRouter } from 'react-router';

import { Announcement } from 'types/Announcement';

import { Alerts, ErrorMessage, SuccessMessage } from 'components/utils/alerts';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';
import { AnnouncementEditor } from '../../../metadata/AnnouncementEditor';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { AdminSearch } from '../../utils/AdminSearch';
import Delete from '../../utils/Delete';

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
  order?: string;
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
    const style = { overflowWrap: 'break-word', wordWrap: 'break-word'  } ;

    this.tableColumns = [
      {
        dataField: 'id',
        hidden: true
      },
      {
        dataField: 'status',
        text: 'Published',
        align: 'center',
        headerStyle: () => {
          return style;
        },
        formatter: (status) => {
          return(
            status === true ? <FaCheck color="green" size={25}/> : <FaTimes color="red" size={25}/>
          );
        }
      },
      {
        dataField: 'created_at',
        text: 'Created Date',
        sort: true,
        onSort: (field, order) => {
          this.dateFormatter(field, order);
          this.setState({order: order});
        },
        headerStyle: () => {
          return { overflowWrap: 'break-word'};
      },
      },
      {
        dataField: 'title',
        text: 'Title',
        headerStyle: () => {
          return style;
        },
        style: () => {
          return style;
        },
      },

      {
        dataField: 'options',
        text: 'Options',
        isDummyField: true,
        formatter: (e, row, rowIndex) => {
          const identifier = this.state.announcements[rowIndex].id;
          if (identifier) {
            return (
                <>
                  <Button color="warning" size="sm" className="mr-3"  onClick={() => this.onEditButtonClick(rowIndex)}>Edit</Button>
                  <Delete
                      path={'announcements'}
                      isContributorPath={this.isContributorPath}
                      index={rowIndex}
                      identifier={identifier}
                      callback={() => this.getAnnouncement()}
                  />
                </>
            );
          } else { return <></>; }
        },
        headerStyle: () => {
          return style;
        },
      }
    ];
  }

  async componentDidMount() {
    this._isMounted = true;
    this.getAnnouncement();
  }

  getAnnouncementQuery = async (offset: number, order?: string): Promise<{ announcements: Announcement[], totalSize: number } | void> => {
    try {
      const
        queryStringParameters = {
          offset: offset,
          limit: this.state.sizePerPage,
          order: order ? order : 'none'
        },
        response = await API.get('tba21', `${this.isContributorPath ? 'contributor' : 'admin'}/announcements`, { queryStringParameters: queryStringParameters });

      return {
        announcements: response.announcements.map(a => ({ ...a, created_at: new Date(a.created_at).toISOString().substr(0, 10) })),
        totalSize: response.announcements[0] && response.announcements[0].count ? parseInt(response.announcements[0].count, 0) : 0
      };

    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({announcements: [], errorMessage: `We've had some trouble getting the list of announcements.`, tableIsLoading: false});
    }
  }

  getAnnouncement = async (order?: string): Promise<void> => {
    try {
      const
        currentIndex = (this.state.page - 1) * this.state.sizePerPage,
        response = await this.getAnnouncementQuery(currentIndex, order);

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

  componentModalToggle = () => {
    if (!this._isMounted) { return; }
    this.setState( prevState => ({
       ...prevState,
       componentModalOpen: !prevState.componentModalOpen
     })
    );
  }

  handleTableChange = async (type, { page, sizePerPage }): Promise<void> => {
    if (type === 'pagination') {
      const currentIndex = (page - 1) * sizePerPage;
      if (!this._isMounted) { return; }
      this.setState({ tableIsLoading: true });

      try {
        let response;
        if (this.state.order === 'desc' || this.state.order === 'asc') {
          response = await this.getAnnouncementQuery(currentIndex, this.state.order);
        } else {  response = await this.getAnnouncementQuery(currentIndex); }
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

  dateFormatter = async (field, order) => {
    this.setState({
                    tableIsLoading: true
                  });
    await this.getAnnouncement(order);
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
        <AdminSearch limit={this.state.sizePerPage} isContributorPath={this.isContributorPath} path={'announcements'}/>

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
              <AnnouncementEditor
                editMode={true}
                path={this.props.location.pathname}
                announcement={this.state.announcements[this.state.editingIndex]}
                onChange={c => {
                  if (this._isMounted && typeof this.state.editingIndex !== 'undefined' && this.state.editingIndex >= 0) {
                    const state = this.state.announcements;
                    state[this.state.editingIndex] = c;
                    this.setState({ announcements: state });
                  }
                }}
              />
              : <></>
            }
          </ModalBody>
          <ModalFooter>
            <Button className="mr-auto" color="secondary" onClick={this.componentModalToggle}>Close</Button>
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

export default withRouter(Announcements);