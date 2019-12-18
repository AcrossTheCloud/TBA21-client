import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle, Container, Spinner
} from 'reactstrap';

import { Item } from 'types/Item';

import { Alerts, ErrorMessage } from '../../../utils/alerts';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { adminGetItems, contributorGetByPerson } from '../../../../REST/items';
import { removeTopology } from '../../../utils/removeTopology';
import { get } from 'lodash';

interface Props {
  limit: number;
}

interface State extends Alerts {
  items: Item[];
  itemIndex?: number;

  byField: string;
  inputQuery: string;

  paginationToken?: string | undefined;
  page: number;
  sizePerPage: number;
  totalSize: number;

  tableIsLoading: boolean;
}

export class SearchItems extends React.Component<Props, State> {
  searchInputRef;
  tableColumns;
  isContributorPath;

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: undefined,
      items: [],
      inputQuery: 'title',
      byField: 'Title',
      tableIsLoading: false,
      page: 1,
      sizePerPage: 15,
      totalSize: 0
    };

    this.searchInputRef = React.createRef();

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
                <Button color="warning" size="sm" className="mr-3">Edit</Button>
                <Button color="danger" size="sm">Delete</Button>
              </>
          );
        },
        headerStyle: () => {
          return style;
        },
      }
    ];
  }

  /**
   * Sets the searchByOption in state to one of the supplied options, used in the listUsers userQuery filter.
   * @param event {React.MouseEvent}
   */
  searchByOption = (event: React.MouseEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    console.log(target.value, 'value');
    this.setState({
      byField: target.value
    });
  }

  getItemsQuery = async (): Promise<{ items: Item[], totalSize: number } | void> => {
    const inputQuery = get(this.searchInputRef, 'current.value');

    if (inputQuery && inputQuery.length) {
      this.setState({ tableIsLoading: true });
      const
         queryStringParameters = {
            limit: this.state.sizePerPage,
            byField: this.state.byField,
            inputQuery: inputQuery
          };
      try {
        const 
            response = this.isContributorPath ? await contributorGetByPerson(queryStringParameters) : await adminGetItems(queryStringParameters),
            items = removeTopology(response) as Item[];
        if (items && items.length) {
          this.setState({
            tableIsLoading: false,
            errorMessage: undefined,
            items: items
          });
        }
      } catch (error) {
        this.setState({
          tableIsLoading: false,
          errorMessage: 'Please try again',
          items: []
        });
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

        {/* START MODALS */}

        {/* END MODALS */}

        <FormGroup name="search" className="search">
          <Label for="search">Search Items</Label>
          <InputGroup>
            <UncontrolledDropdown addonType="prepend" type="select" name="searchBy" id="searchBy">
              <DropdownToggle caret>{this.state.byField}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={this.searchByOption} value="Title">Title</DropdownItem>
                <DropdownItem onClick={this.searchByOption} value="Creator">Creator</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <Input type="text" name="search" id="search" placeholder="Search Items" innerRef={this.searchInputRef} />

            <InputGroupAddon addonType="append">
              <Button type="submit" onClick={this.getItemsQuery}>Search</Button>
            </InputGroupAddon>
          </InputGroup>

          <ErrorMessage message={this.state.errorMessage}/>

          {
            this.state.items.length ?
                <BootstrapTable
                    remote
                    bootstrap4
                    className="itemTable"
                    keyField="s3_key"
                    data={this.state.tableIsLoading ? [] : items}
                    columns={this.tableColumns}
                    pagination={paginationFactory({ page, sizePerPage, totalSize })}
                    // onTableChange={this.handleTableChange}
                    noDataIndication={() => !this.state.tableIsLoading && !slicedItems.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
                />
              : <></>
          }
          {
            this.state.paginationToken ?
              <Button  color="primary" size="lg">
                Load More &nbsp; />
              </Button>
              : <></>
          }
        </FormGroup>
      </Container>
    );
  }
}
