import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import { Collection } from 'types/Collection';
import { CollectionEditor } from 'components/metadata/CollectionEditor';
import { AdminSearch } from '../../utils/AdminSearch';

import { Alerts, ErrorMessage, SuccessMessage } from 'components/utils/alerts';
import { RouteComponentProps, withRouter } from 'react-router';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { adminGet } from '../../../../REST/collections';
import { removeTopology } from '../../../utils/removeTopology';
import Delete from '../../utils/Delete';

interface State extends Alerts {
  collections: Collection[];
  editingCollectionIndex?: number;

  componentModalOpen: boolean;
  deleteModalOpen: boolean;

  tableIsLoading: boolean;
  page: number;
  sizePerPage: number;
  totalSize: number;

  deleteErrorMessage: string | JSX.Element | undefined;
  order?: string;
}

class Collections extends React.Component<RouteComponentProps, State> {
  _isMounted;
  tableColumns;
  isAdmin;
  isContributorPath;

  constructor(props: RouteComponentProps) {
    super(props);
    this._isMounted = false;

    this.state = {
      componentModalOpen: false,
      deleteModalOpen: false,
      collections: [],

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
        align: 'center',
        text: 'Published',
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
        formatter: (cell: string) => {
          return cell.toString().slice(0, 10);
          },
        headerStyle: () => {
          return style;
        },
        style: () => {
          return style;
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
          const identifier = this.state.collections[rowIndex].id;
          if (identifier) {
            return (
              <>
                <Button color="warning" size="sm" className="mr-3"  onClick={() => this.onEditButtonClick(rowIndex)}>Edit</Button>
                <Delete
                    path={'collections'}
                    isContributorPath={this.isContributorPath}
                    index={rowIndex}
                    identifier={identifier}
                    callback={() => this.getCollections()}
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
    this.isAdmin = !!this.props.location.pathname.match(/admin/i);
    this.isContributorPath = (this.props.location.pathname.match(/contributor/i));
    this.getCollections();
  }

  getCollectionsQuery = async (offset: number, order?: string): Promise<{ collections: Collection[], totalSize: number } | void> => {
    try {
      const
        queryStringParameters = {
          offset: offset,
          limit: this.state.sizePerPage,
          order: order ? order : 'desc'
      };

      const result = await adminGet(this.isContributorPath, queryStringParameters);
      const collections: Collection[] = removeTopology(result) as Collection[];

      return {
        collections,
        totalSize: collections[0] && collections[0].count ? (typeof collections[0].count === 'string' ? parseInt(collections[0].count, 0) : collections[0].count) : 0
      };

    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({collections: [], errorMessage: `We've had some trouble getting the list of collections.`, tableIsLoading: false});
    }
  }

  getCollections = async (order?: string): Promise<void> => {
    try {
      const
        currentIndex = (this.state.page - 1) * this.state.sizePerPage,
        response = await this.getCollectionsQuery(currentIndex, order);

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
        let response;
        if (this.state.order === 'desc' || this.state.order === 'asc') {
          response = await this.getCollectionsQuery(currentIndex, this.state.order);
        } else {  response = await this.getCollectionsQuery(currentIndex); }
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

  dateFormatter = async (field, order) => {
    this.setState({
                    tableIsLoading: true
                  });
    await this.getCollections(order);
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
        <AdminSearch
          limit={this.state.sizePerPage}
          isContributorPath={this.isContributorPath}
          path={'collections'}
          isAdmin={this.isAdmin}
        />
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
                    isAdmin={this.isAdmin}
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

export default withRouter(Collections);