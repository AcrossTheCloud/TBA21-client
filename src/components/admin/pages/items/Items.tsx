import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import { Item } from 'types/Item';
import { ItemEditor } from 'components/metadata/ItemEditor';
import { Alerts, ErrorMessage } from 'components/utils/alerts';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';

interface State extends Alerts {
  items: Item[];
  editingItemIndex?: number;

  componentModalOpen: boolean;

  tableIsLoading: boolean;
  page: number;
  sizePerPage: number;
  totalSize: number;
}

export default class Items extends React.Component<{}, State> {
  _isMounted;
  tableColumns;

  constructor(props: {}) {
    super(props);
    this._isMounted = false;

    this.state = {
      componentModalOpen: false,
      items: [],

      tableIsLoading: true,
      page: 1,
      sizePerPage: 15,
      totalSize: 0,
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
        },
        response = await API.get('tba21', 'admin/items', { queryStringParameters: queryStringParameters });

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
        editingItemIndex: itemIndex,
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

        <Modal isOpen={this.state.componentModalOpen} className="tableModal fullwidth">
          <ModalBody>

            {
              typeof this.state.editingItemIndex !== 'undefined' && this.state.editingItemIndex >= 0 ?
                <ItemEditor
                  item={this.state.items[this.state.editingItemIndex]}
                  onChange={c => {
                    if (this._isMounted && typeof this.state.editingItemIndex !== 'undefined' && this.state.editingItemIndex >= 0) {
                      const stateItems = this.state.items;
                      stateItems[this.state.editingItemIndex] = c;
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
      </Container>
    );
  }
}
