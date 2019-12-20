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
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle, Container, Spinner
} from 'reactstrap';

import { Item } from 'types/Item';
import { Collection } from '../../../types/Collection';
import { Announcement } from '../../../types/Announcement';

import { Alerts, ErrorMessage } from '../../utils/alerts';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { adminGetItems, contributorGetByPerson } from '../../../REST/items';
import { removeTopology } from '../../utils/removeTopology';
import { get } from 'lodash';
import { adminGet } from '../../../REST/collections';
import { API } from 'aws-amplify';

interface Props {
  limit: number;
  isContributorPath: boolean;
  path: string;
}

interface State extends Alerts {
  results: Item[] | Collection[] | Announcement[];
  itemIndex?: number;

  byField: string;
  inputQuery: string;

  paginationToken?: string | undefined;
  page: number;
  sizePerPage: number;
  totalSize: number;

  tableIsLoading: boolean;
}

export class AdminSearch extends React.Component<Props, State> {
  searchInputRef;
  tableColumns;

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: undefined,
      results: [],
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
        hidden: this.props.isContributorPath || this.props.path !== 'items',
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
    this.setState({
      byField: target.value
    });
  }

  getResultsQuery = async (): Promise<{ results: Item[], totalSize: number } | void> => {
    let path = this.props.path;

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
        let results;
        if (path === 'items') {
          const response = this.props.isContributorPath ? await contributorGetByPerson(queryStringParameters) : await adminGetItems(queryStringParameters);
          results = removeTopology(response) as Item[];
        }
        if (path === 'collections') {
          const response = await adminGet(this.props.isContributorPath, queryStringParameters);
          results = removeTopology(response) as Collection[];
        }
        if (path === 'announcements') {
          const response = await API.get('tba21', `${this.props.isContributorPath ? 'contributor' : 'admin'}/announcements`, { queryStringParameters: queryStringParameters });
          results = response.announcements.map(a => ({ ...a, created_at: new Date(a.created_at).toISOString().substr(0, 10) }));
        }
        if (results && results.length) {
          this.setState({
            tableIsLoading: false,
            errorMessage: undefined,
            results: results
          });
        }
      } catch (error) {
        this.setState({
          tableIsLoading: false,
          errorMessage: 'Please try again',
          results: []
        });
      }
          
    }
  }

  render() {
    const
        { page, sizePerPage, totalSize } = this.state,
        results = this.state.results,
        currentIndex = (page - 1) * sizePerPage,
        slicedItems = results.length ? results.slice(currentIndex, currentIndex + sizePerPage) : [];
    return (
      <Container>

        {/* START MODALS */}

        {/* END MODALS */}

        <FormGroup name="search" className="search">
          <InputGroup>
            <UncontrolledDropdown addonType="prepend" type="select" name="searchBy" id="searchBy">
              <DropdownToggle caret>{this.state.byField}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={this.searchByOption} value="Title">Title</DropdownItem>
                { this.props.path === 'announcements' ? <></> :
                  <DropdownItem onClick={this.searchByOption} value="Creator">Creator</DropdownItem>
                }
                    </DropdownMenu>
                    </UncontrolledDropdown>
                    <Input type="text" name="search" id="search" placeholder={'Search ' + this.props.path} innerRef={this.searchInputRef} />

            <InputGroupAddon addonType="append">
              <Button type="submit" onClick={this.getResultsQuery}>Search</Button>
            </InputGroupAddon>
          </InputGroup>

          <ErrorMessage message={this.state.errorMessage}/>

          {
            this.state.results.length ?
                <BootstrapTable
                    remote
                    bootstrap4
                    className="itemTable"
                    keyField="s3_key"
                    data={this.state.tableIsLoading ? [] : results}
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
