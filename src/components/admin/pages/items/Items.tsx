import { API } from 'aws-amplify';
import { RouteComponentProps, withRouter } from 'react-router';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';

import { FaCheck, FaTimes } from 'react-icons/fa';
import { Item } from 'types/Item';
import ItemEditor from 'components/metadata/ItemEditor';
import { Alerts, ErrorMessage, SuccessMessage } from 'components/utils/alerts';
import { AuthContext } from '../../../../providers/AuthProvider';
import { SearchItems } from './SearchItems';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';
import { adminGetItems, contributorGetByPerson } from '../../../../REST/items';
import { removeTopology } from '../../../utils/removeTopology';

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
  order?: string;
}

class Items extends React.Component<RouteComponentProps, State> {
  _isMounted;
  isContributorPath;
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
    const style = { overflowWrap: 'break-word', wordWrap: 'break-word'  } ;

    this.tableColumns = [
      {
        dataField: 's3_key',
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
          return status === true ? <FaCheck color="green" size={25}/> : <FaTimes color="red" size={25}/> ;
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
          return ( cell.toString().slice(0, 10) );
        },
        headerStyle: () => {
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
        dataField: 'creators',
        formatter: (cell: string[]) => {
          return Array.isArray(cell) ?
            cell.join(', ')
            :
            '';
        }, headerStyle: () => {
          return style;
        },
        style: () => {
          return style;
        },
        hidden: !!this.isContributorPath,
        text: 'Creator(s)'
      },
      {
        dataField: 'options',
        text: 'Options',
        isDummyField: true,
        formatter: (e, row, rowIndex) => {
          return (
            <>
              <Button color="warning" size="sm" className="mr-3" onClick={() => this.onEditButtonClick(rowIndex)}>Edit</Button>
              <Button color="danger" size="sm" onClick={() => this.onDeleteButtonClick(rowIndex)}>Delete</Button>
            </>
          );
        },
        headerStyle: () => {
          return style;
        },
      }
    ];
  }

  async componentDidMount() {
    this._isMounted = true;
    this.isContributorPath = (this.props.location.pathname.match(/contributor/i));
    this.getItems();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getItemsQuery = async (offset: number, order?: string): Promise<{ items: Item[], totalSize: number } | void> => {
    try {
      const
        queryStringParameters = {
          offset: offset,
          limit: this.state.sizePerPage,
          order: order ? order : 'none'
        },
        response = this.isContributorPath ? await contributorGetByPerson(queryStringParameters) : await adminGetItems(queryStringParameters),
        items = removeTopology(response) as Item[];
      if (!this._isMounted) { return; }
      return {
        items: items,
        totalSize: items[0] && items[0].count ? (typeof items[0].count === 'string' ? parseInt(items[0].count, 0) : items[0].count) : 0
      };

    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({items: [], errorMessage: `${e} - We've had some trouble getting the list of items.`, tableIsLoading: false});
    }
  }

  getItems = async (order?: string): Promise<void> => {
    try {
      const
        currentIndex = (this.state.page - 1) * this.state.sizePerPage,
        response = await this.getItemsQuery(currentIndex, order);

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
      deleteErrorMessage: undefined,
      successMessage: undefined
     })
    );
  }

  deleteItem = async () => {
    const state = {
      deleteErrorMessage: undefined,
      successMessage: undefined
    };
    try {
      const itemIndex: number | undefined = this.state.itemIndex;
      if (typeof itemIndex !== 'undefined' && itemIndex > -1) {
        await API.del('tba21', (this.isContributorPath ? 'contributor/items' :  'admin/items'), {
          queryStringParameters: {
            s3Key: this.state.items[itemIndex].s3_key
          }
        });
        await this.getItems();
        Object.assign(state, {
          deleteModalOpen: false,
          successMessage: 'Item deleted'
        });
      } else {
        Object.assign(state, {
          deleteErrorMessage: 'This item may have already been deleted.',
          deleteModalOpen: false
        });
        await this.getItems();
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
        let response;
        if (this.state.order === 'desc' || this.state.order === 'asc') {
          response = await this.getItemsQuery(currentIndex, this.state.order);
        } else {  response = await this.getItemsQuery(currentIndex); }
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
  
  dateFormatter = async (field, order) => {
    this.setState({
                    tableIsLoading: true
                  });
    await this.getItems(order);
  }

  render() {
    const
      { page, sizePerPage, totalSize } = this.state,
      items = this.state.items,
      currentIndex = (page - 1) * sizePerPage,
      slicedItems = items.length ? items.slice(currentIndex, currentIndex + sizePerPage) : [];

    const context: React.ContextType<typeof AuthContext> = this.context;

    return (
      <Container>
        <ErrorMessage message={this.state.errorMessage}/>
        <SuccessMessage message={this.state.successMessage}/>
        <SearchItems limit={this.state.sizePerPage} isContributorPath={this.isContributorPath} path={'items'}/>
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
        <Modal isOpen={this.state.componentModalOpen} centered size="lg" scrollable backdrop className="fullwidth">
          <ModalBody>

            {
              typeof this.state.itemIndex !== 'undefined' && this.state.itemIndex >= 0 ?
                <ItemEditor
                  isAdmin={context.authorisation.hasOwnProperty('admin')}
                  isContributorPath={context.authorisation.hasOwnProperty('admin') ? false : this.isContributorPath}
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
        <Modal isOpen={this.state.deleteModalOpen}>
          <ErrorMessage message={this.state.deleteErrorMessage}/>
          <ModalHeader>Delete Item?</ModalHeader>
          <ModalBody>Are you 100% sure you want to delete this item?</ModalBody>
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
Items.contextType = AuthContext;
