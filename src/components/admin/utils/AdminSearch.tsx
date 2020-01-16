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
  DropdownToggle,
  Container,
  Spinner,
  Modal,
  ModalBody, ModalFooter
} from 'reactstrap';

import { Item } from 'types/Item';
import { Collection } from '../../../types/Collection';
import { Announcement } from '../../../types/Announcement';

import { Alerts, ErrorMessage, SuccessMessage } from '../../utils/alerts';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { adminGetItems, contributorGetByPerson } from '../../../REST/items';
import { removeTopology } from '../../utils/removeTopology';
import { get } from 'lodash';
import { adminGet } from '../../../REST/collections';
import { API } from 'aws-amplify';
import Delete from './Delete';
import { CollectionEditor } from '../..';
import ItemEditor from '../../metadata/ItemEditor';
import { AnnouncementEditor } from '../../metadata/AnnouncementEditor';

interface Props {
  limit: number;
  isContributorPath: boolean;
  isAdmin: boolean;
  path: string;
}

interface State extends Alerts {
  results: Item[] | Collection[] | Announcement[];
  itemIndex?: number;
  editResult?: Item | Collection | Announcement;

  byField: string;
  inputQuery: string;

  paginationToken?: string | undefined;
  page: number;
  sizePerPage: number;
  totalSize: number;

  tableIsLoading: boolean;
  componentModalOpen: boolean;
}

export class AdminSearch extends React.Component<Props, State> {
  searchInputRef;
  tableColumns;

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: undefined,
      successMessage: undefined,
      results: [],
      inputQuery: 'title',
      byField: 'Title',
      tableIsLoading: false,
      page: 1,
      sizePerPage: 15,
      totalSize: 0,
      componentModalOpen: false
    };

    this.searchInputRef = React.createRef();

    const style = { overflowWrap: 'break-word', wordWrap: 'break-word'  } ;

    this.tableColumns = [
      {
        dataField: 's3_key',
        hidden: true
      },
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
          let result: Item | Collection | Announcement = this.state.results[rowIndex] as Collection | Announcement;
          let identifier = result.id;
          if (this.props.path === 'items') {
            result = this.state.results[rowIndex] as Item;
            identifier = result.s3_key;
          }
          if (identifier && result) {
            return (
                <>
                  <Button color="warning" size="sm" className="mr-3" onClick={() => this.editResult(result)}>Edit</Button>
                  <Delete
                      path={this.props.path}
                      isContributorPath={this.props.isContributorPath}
                      index={rowIndex}
                      identifier={identifier}
                      callback={() => this.getResultsQuery()}
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

  editResult = (result) => {
    if (result) {
      this.setState({
                      componentModalOpen: true,
                      editResult: result
                    });
    }
  }

  componentModalToggle = () => {
    this.setState( prevState => ({
                     ...prevState,
                     componentModalOpen: !prevState.componentModalOpen
                   })
    );

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
        slicedItems = results.length ? results.slice(currentIndex, currentIndex + sizePerPage) : [],
        path = this.props.path;
    return (
      <Container>
        <ErrorMessage message={this.state.errorMessage}/>
        <SuccessMessage message={this.state.successMessage}/>
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

        {/*Start Modals*/}
          <Modal isOpen={this.state.componentModalOpen} className="fullwidth">
            <ModalBody>
              {
                path === 'items' && this.state.editResult ?
                    <ItemEditor
                        item={this.state.editResult as Item}
                        isAdmin={this.props.isAdmin}
                    />
                    : <></>
              }
              {
                path === 'collections' && this.state.editResult ?
                    <CollectionEditor
                        editMode={true}
                        collection={this.state.editResult as Collection}
                        isAdmin={this.props.isAdmin}
                    />
                    : <></>
              }
              {
                path === 'announcements' && this.state.editResult ?
                    <AnnouncementEditor
                        editMode={true}
                        announcement={this.state.editResult as Announcement}
                        path={path}
                    />
                    : <></>
              }
            </ModalBody>
            <ModalFooter>
              <Button className="mr-auto" color="secondary" onClick={this.componentModalToggle}>Close</Button>
            </ModalFooter>
          </Modal>
        {/*End Modals*/}

      </Container>
    );
  }
}
