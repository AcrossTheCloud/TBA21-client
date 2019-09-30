import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';

import { Collection } from 'types/Collection';
import { CollectionEditor } from 'components/metadata/CollectionEditor';

import { Alerts, ErrorMessage, SuccessMessage } from 'components/utils/alerts';
import { RouteComponentProps, withRouter } from 'react-router';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface State extends Alerts {
  collections: Collection[];
  editingCollectionIndex?: number;
  // items?: items[];

  componentModalOpen: boolean;
  deleteModalOpen: boolean;

  tableIsLoading: boolean;
  page: number;
  sizePerPage: number;
  totalSize: number;

  deleteErrorMessage: string | JSX.Element | undefined;
}

class Collections extends React.Component<RouteComponentProps, State> {
  _isMounted;
  tableColumns;

  constructor(props: RouteComponentProps) {
    super(props);
    this._isMounted = false;

    this.state = {
      componentModalOpen: false,
      deleteModalOpen: false,
      collections: [],
      // items: [],

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
        align: 'center',
        text: 'Published',
        formatter: (status) => {
          return(
            status === true ? <FaCheck color="green" size={25}/> : <FaTimes color="red" size={25}/>
          );
        }
      },
      {
        dataField: 'title',
        text: 'Title'
      },
      {
        dataField: 'options',
        text: 'options',
        isDummyField: true,
        formatter: (e, row, rowIndex) => {
          return (
            <>
              <Button color="warning" size="sm" className="mr-3"  onClick={() => this.onEditButtonClick(rowIndex)}>Edit</Button>
              <Button color="danger" size="sm" onClick={() => this.onDeleteButtonClick(rowIndex)}>Delete</Button>
            </>
          );
        }
      }
    ];
  }

  async componentDidMount() {
    this._isMounted = true;
    this.getCollections();
  }

  getCollectionsQuery = async (offset: number): Promise<{ collections: Collection[], totalSize: number } | void> => {
    try {
      const
        queryStringParameters = {
          offset: offset,
          limit: this.state.sizePerPage
        };

      const isContributorPath = (this.props.location.pathname.match(/contributor/i));
      const response = await API.get('tba21', `${ isContributorPath ? 'contributor/collections/get' :  'admin/collections/get' }`, { queryStringParameters: queryStringParameters });

      return {
        collections: response.collections,
        totalSize: response.collections[0] && response.collections[0].count ? parseInt(response.collections[0].count, 0) : 0
      };

    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({collections: [], errorMessage: `We've had some trouble getting the list of collections.`, tableIsLoading: false});
    }
  }

  getCollections = async (): Promise<void> => {
    try {
      const
        currentIndex = (this.state.page - 1) * this.state.sizePerPage,
        response = await this.getCollectionsQuery(currentIndex);

      if (response) {
        const { collections, totalSize } = response;

        if (!this._isMounted) { return; }
        this.setState(
          {
            collections: collections,
            tableIsLoading: false,
            totalSize: totalSize
          }
        );
      }
    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({collections: [], errorMessage: `We've had some trouble getting the list of collections.`, tableIsLoading: false});
    }
  }

  onEditButtonClick = (collectionIndex: number) => {
    if (!this._isMounted) { return; }
    this.setState(
      {
        componentModalOpen: true,
        editingCollectionIndex: collectionIndex,
      }
    );
  }
  onDeleteButtonClick = (collectionIndex: number) => {
    if (!this._isMounted) { return; }
    this.setState(
      {
        deleteModalOpen: true,
        editingCollectionIndex: collectionIndex,
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
  deleteCollection = async () => {
    const state = {
      deleteErrorMessage: undefined,
      successMessage: undefined
    };
    try {
      const collectionIndex: number | undefined = this.state.editingCollectionIndex;
      if (typeof collectionIndex !== 'undefined' && collectionIndex > -1) {
        await API.del('tba21', 'admin/collections', {
          queryStringParameters: {
            id: this.state.collections[collectionIndex].id
          }
        });
        this.getCollections();
        Object.assign(state, {
          deleteModalOpen: false,
          successMessage: 'Collection deleted'
        });
      } else {
        Object.assign(state, {
          deleteErrorMessage: 'This collection may have already been deleted.',
          deleteModalOpen: false
        });
        this.getCollections();
      }

    } catch (e) {
      Object.assign(state, {
        deleteErrorMessage: 'We had some trouble deleting this collection. Please try again later.'
      });
    } finally {
      if (!this._isMounted) { return; }
      this.setState(state);
    }
  }

  handleTableChange = async (type, { page, sizePerPage }): Promise<void> => {
    if (type === 'pagination') {
      const currentIndex = (page - 1) * sizePerPage;
      if (!this._isMounted) { return; }
      this.setState({ tableIsLoading: true });

      try {
        const response = await this.getCollectionsQuery(currentIndex);
        if (response) {
          if (!this._isMounted) { return; }

          this.setState({
            errorMessage: undefined,
            page,
            sizePerPage,
            collections: response.collections,
            tableIsLoading: false
          });
        }

      } catch (e) {
        if (!this._isMounted) { return; }
        this.setState({page: this.state.page - 1, errorMessage: `We've had some trouble getting the list of collections.`, tableIsLoading: false});
      }
    }
  }

  render() {
    const
      { page, sizePerPage, totalSize } = this.state,
      collections = this.state.collections,
      currentIndex = (page - 1) * sizePerPage,
      slicedItems = collections.length ? collections.slice(currentIndex, currentIndex + sizePerPage) : [];

    return (
      <Container>
        <ErrorMessage message={this.state.errorMessage}/>
        <SuccessMessage message={this.state.successMessage}/>
        <BootstrapTable
          remote
          bootstrap4
          className="collectionTable"
          keyField="id"
          data={this.state.tableIsLoading ? [] : collections}
          columns={this.tableColumns}
          pagination={paginationFactory({ page, sizePerPage, totalSize })}
          onTableChange={this.handleTableChange}
          noDataIndication={() => !this.state.tableIsLoading && !slicedItems.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
        />

        <Modal isOpen={this.state.componentModalOpen} className="fullwidth">
          <ModalBody>
            {
              typeof this.state.editingCollectionIndex !== 'undefined' && this.state.editingCollectionIndex >= 0 ?
                <CollectionEditor
                    editMode={true}
                    collection={this.state.collections[this.state.editingCollectionIndex]}
                    onChange={c => {
                      if (this._isMounted && typeof this.state.editingCollectionIndex !== 'undefined' && this.state.editingCollectionIndex >= 0) {
                        const stateCollections = this.state.collections;
                        stateCollections[this.state.editingCollectionIndex] = c;
                        this.setState({ collections: stateCollections });
                      }
                    }}
                />
            :
              <></>
            }

          </ModalBody>
          <ModalFooter>
            <Button className="mr-auto" color="secondary" onClick={this.componentModalToggle}>Close</Button>
          </ModalFooter>
        </Modal>
        {/* Delete Collection Modal */}
        <Modal isOpen={this.state.deleteModalOpen}>
          <ErrorMessage message={this.state.deleteErrorMessage}/>
          <ModalHeader>Delete Collection?</ModalHeader>
          <ModalBody>Are you 100% sure you want to delete this collection?

          </ModalBody>

          <ModalFooter>
            <Button color="danger" className="mr-auto" onClick={this.deleteCollection}>I'm Sure</Button>{' '}
            <Button color="secondary" onClick={this.deleteModalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

export default withRouter(Collections);
