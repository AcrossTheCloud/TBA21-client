import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';

import { Item } from 'types/Item';
import { ItemEditor } from 'components/metadata/ItemEditor';
import { Alerts, ErrorMessage, SuccessMessage } from 'components/utils/alerts';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { RouteComponentProps, withRouter } from 'react-router';

import 'styles/components/admin/tables/modal.scss';

interface State extends Alerts {
  items: Item[];
  itemIndex?: number;

  componentModalOpen: boolean;
  deleteModalOpen: boolean;

  tableIsLoading: boolean;
  page: number;
  sizePerPage: number;
  totalSize: number;

  deleteErrorMessage: string | JSX.Element | undefined;
}

class Items extends React.Component<RouteComponentProps, State> {
  _isMounted;
  tableColumns;

  constructor(props: RouteComponentProps) {
    super(props);
    this._isMounted = false;

    this.state = {
      componentModalOpen: false,
      deleteModalOpen: false,
      items: [],

      tableIsLoading: true,
      page: 1,
      sizePerPage: 15,
      totalSize: 0,
      deleteErrorMessage: undefined
    };

    this.tableColumns = [
      {
        dataField: 's3_key',
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
    this.getItems();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getItemsQuery = async (offset: number): Promise<{ items: Item[], totalSize: number } | void> => {
    try {
      const
        queryStringParameters = {
          offset: offset,
          limit: this.state.sizePerPage
        };
      const isContributorPath = this.props.location.pathname === '/contributor/items';
      const response = await API.get('tba21', `${ isContributorPath ? 'contributor/items/getByPerson' :  'admin/items' }`, { queryStringParameters: queryStringParameters });

      if (!this._isMounted) { return; }
      return {
        items: response.items,
        totalSize: response.items[0] && response.items[0].count ? parseInt(response.items[0].count, 0) : 0
      };

    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({items: [], errorMessage: `${e} - We've had some trouble getting the list of items.`, tableIsLoading: false});
    }
  }

  getItems = async (): Promise<void> => {
    try {
      const
        currentIndex = (this.state.page - 1) * this.state.sizePerPage,
        response = await this.getItemsQuery(currentIndex);

      if (response) {
        const { items, totalSize } = response;

        if (!this._isMounted) { return; }
        this.setState(
          {
            items: items,
            tableIsLoading: false,
            totalSize: totalSize
          }
        );
      }
    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({items: [], errorMessage: `${e} - We've had some trouble getting the list of items.`, tableIsLoading: false});
    }
  }

  onEditButtonClick = (itemIndex: number) => {
    if (!this._isMounted) { return; }
    this.setState(
      {
        componentModalOpen: true,
        itemIndex: itemIndex,
      }
    );
  }
  onDeleteButtonClick = (itemIndex: number) => {
    if (!this._isMounted) { return; }
    this.setState(
      {
        deleteModalOpen: true,
        itemIndex: itemIndex,
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
      deleteErrorMessage: '',
      successMessage: ''
     })
    );
  }

  deleteItem = async () => {
    const state = {
      deleteErrorMessage: '',
      successMessage: ''
    };
    try {
      const itemIndex: number | undefined = this.state.itemIndex;
      if (typeof itemIndex !== 'undefined' && itemIndex > -1) {
        await API.del('tba21', 'admin/items', {
          queryStringParameters: {
            s3Key: this.state.items[itemIndex].s3_key
          }
        });
        this.getItems();
        Object.assign(state, {
          deleteModalOpen: false,
          successMessage: 'Item deleted'
        });
      } else {
        Object.assign(state, {
          deleteErrorMessage: 'This item may have already been deleted.',
          deleteModalOpen: false
        });
        this.getItems();
      }

    } catch (e) {
        Object.assign(state, {
          deleteErrorMessage: 'We had some trouble deleting this item. Please try again later.'
        });
    } finally {
      this.setState(state);
    }
  }

  handleTableChange = async (type, { page, sizePerPage }): Promise<void> => {
    if (type === 'pagination') {
      const currentIndex = (page - 1) * sizePerPage;
      if (!this._isMounted) { return; }
      this.setState({ tableIsLoading: true });

      try {
        const response = await this.getItemsQuery(currentIndex);
        if (response) {
          if (!this._isMounted) { return; }

          this.setState({
            errorMessage: undefined,
            page,
            sizePerPage,
            items: response.items,
            tableIsLoading: false
          });
        }

      } catch (e) {
        if (!this._isMounted) { return; }
        this.setState({page: this.state.page - 1, errorMessage: `We've had some trouble getting the list of items.`, tableIsLoading: false});
      }
    }
  }

  render() {
    const
      { page, sizePerPage, totalSize } = this.state,
      items = this.state.items,
      currentIndex = (page - 1) * sizePerPage,
      slicedItems = items.length ? items.slice(currentIndex, currentIndex + sizePerPage) : [];

    return (
      <Container>
        <ErrorMessage message={this.state.errorMessage}/>
        <SuccessMessage message={this.state.successMessage}/>
        <BootstrapTable
          remote
          bootstrap4
          className="itemTable"
          keyField="s3_key"
          data={this.state.tableIsLoading ? [] : items}
          columns={this.tableColumns}
          pagination={paginationFactory({ page, sizePerPage, totalSize })}
          onTableChange={this.handleTableChange}
          noDataIndication={() => !this.state.tableIsLoading && !slicedItems.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
        />
        {/* Edit Item Modal */}
        <Modal isOpen={this.state.componentModalOpen} className="tableModal fullwidth">
          <ModalBody>

            {
              typeof this.state.itemIndex !== 'undefined' && this.state.itemIndex >= 0 ?
                <ItemEditor
                  item={this.state.items[this.state.itemIndex]}
                  index={this.state.itemIndex}
                  onChange={c => {
                    if (this._isMounted && typeof this.state.itemIndex !== 'undefined' && this.state.itemIndex >= 0) {
                      const stateItems = this.state.items;
                      stateItems[c.index] = c.item;
                      this.setState({ items: stateItems });
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

        {/* Delete Item Modal */}
        <Modal isOpen={this.state.deleteModalOpen} className="tableModal">
          <ErrorMessage message={this.state.deleteErrorMessage}/>
          <ModalHeader>Delete Item?</ModalHeader>
          <ModalBody>Are you 100% sure you want to delete this item?

          </ModalBody>

            <ModalFooter>
              <Button color="danger" className="mr-auto" onClick={this.deleteItem}>I'm Sure</Button>{' '}
              <Button color="secondary" onClick={this.deleteModalToggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

export default withRouter(Items);