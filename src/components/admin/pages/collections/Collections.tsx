import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import { Collection } from 'types/Collection';
import { CollectionEditor } from 'components/metadata/CollectionEditor';

import { Alerts, ErrorMessage } from 'components/utils/alerts';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';

interface State extends Alerts {
  collections: Collection[];
  editingCollectionIndex?: number;
  // items?: items[];

  componentModalOpen: boolean;

  tableIsLoading: boolean;
  page: number;
  sizePerPage: number;
  totalSize: number;
}

export default class Collections extends React.Component<{}, State> {
  _isMounted;
  tableColumns;

  constructor(props: {}) {
    super(props);
    this._isMounted = false;

    this.state = {
      componentModalOpen: false,
      collections: [],
      // items: [],

      tableIsLoading: true,
      page: 1,
      sizePerPage: 15,
      totalSize: 0,
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
        },
        response = await API.get('tba21', 'admin/collections/get', { queryStringParameters: queryStringParameters });

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

        <Modal isOpen={this.state.componentModalOpen} className="tableModal fullwidth">
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
      </Container>
    );
  }
}
