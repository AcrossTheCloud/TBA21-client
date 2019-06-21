import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import DraggableMap from 'components/map/DraggableMap';
import { FileUpload } from './FileUpload';

import { Item } from 'types/Item';
import { Position } from 'types/Map';

import { Alerts, ErrorMessage } from 'components/utils/alerts';
import { TitleAndDescription } from 'components/admin/tables/utils/TitleAndDescription';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import 'styles/components/admin/tables/modal.scss';

interface State extends Alerts {
  wizardCurrentStep: number;
  wizardStepMax: number;

  items: Item[];
  componentModalOpen: boolean;
  rowEditingId: number | undefined;

  tableIsLoading: boolean;
  page: number;
  sizePerPage: number;
  totalSize: number;
}

export default class ItemsTable extends React.Component<{}, State> {
  _isMounted;
  tableColumns;

  constructor(props: {}) {
    super(props);
    this._isMounted = false;

    this.state = {
      wizardCurrentStep: 1,
      wizardStepMax: 5,

      componentModalOpen: false,
      items: [],
      rowEditingId: undefined,

      tableIsLoading: true,
      page: 1,
      sizePerPage: 2,
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
              <Button color="warning" size="sm" onClick={() => this.onEditButtonClick(row)}>Edit</Button>
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

  getItemsQuery = async (offset: number): Promise<{ items: Item[], totalSize: number } | void> => {
    try {
      const
        queryStringParameters = {
          offset: offset,
          limit: this.state.sizePerPage
        },
        response = await API.get('tba21', 'admin/items/get', { queryStringParameters: queryStringParameters });

      if (!this._isMounted) { return; }
      return {
        items: response.items,
        totalSize: parseInt(response.items[0].count, 0)
      };

    } catch (e) {
      if (!this._isMounted) { return; }
      this.setState({items: [], errorMessage: `We've had some trouble getting the list of items.`, tableIsLoading: false});
    }
  }

  getItems = async (): Promise<void> => {
    try {
      const response = await this.getItemsQuery(0);

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
      this.setState({items: [], errorMessage: `We've had some trouble getting the list of items.`, tableIsLoading: false});
    }
  }

  onEditButtonClick = (row: Item) => {
    this.setState(
{
        componentModalOpen: true,
        wizardCurrentStep: 1,
        rowEditingId: row.id,
      }
    );
  }

  componentModalToggle = () => {
    this.setState( prevState => ({
      ...prevState,
      componentModalOpen: !prevState.componentModalOpen
      })
    );
  }

  DraggableMapPosition = (markerPos: Position) => {
    console.log(markerPos.lat, markerPos.lng);
  }

  Wizard = (props: { step: number }) => {
    switch (props.step) {
      case 1 :
        return (
          <TitleAndDescription
            title={this.state.rowEditingId ? this.state.items[this.state.rowEditingId].title : ''}
            description={this.state.rowEditingId ? this.state.items[this.state.rowEditingId].description : ''}
            callback={() => { console.log('hh'); }}
          />
          );
      case 2 :
        return <FileUpload />;
      case 3 :
        return <DraggableMap positionCallback={this.DraggableMapPosition} geojson={this.state.rowEditingId ? this.state.items[this.state.rowEditingId].geojson : ''}/>;

      default:
        return <></>;
    }
  }
  handleWizardNextStep = () => {
    let stepNumber = this.state.wizardCurrentStep;
    stepNumber++;
    this.setState({
      wizardCurrentStep: stepNumber,
    });
  }
  handleWizardPrevStep = () => {
    let stepNumber = this.state.wizardCurrentStep;
    stepNumber--;
    this.setState({ wizardCurrentStep: stepNumber });
  }

  handleTableChange = async (type, { page, sizePerPage }): Promise<void> => {
    if (type === 'pagination') {
      const currentIndex = (page - 1) * sizePerPage;
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
      <>
        <ErrorMessage message={this.state.errorMessage}/>
        <BootstrapTable
          remote
          bootstrap4
          className="itemTable"
          keyField="id"
          data={this.state.tableIsLoading ? [] : items}
          columns={this.tableColumns}
          pagination={paginationFactory({ page, sizePerPage, totalSize })}
          onTableChange={this.handleTableChange}
          noDataIndication={() => !this.state.tableIsLoading && !slicedItems.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
        />

        <Modal isOpen={this.state.componentModalOpen} className="tableModal fullwidth">
          <ModalBody>

            <this.Wizard step={this.state.wizardCurrentStep}/>

          </ModalBody>
          <ModalFooter>
            <Button className="mr-auto" color="secondary" onClick={this.componentModalToggle}>Cancel</Button>

            {(this.state.wizardCurrentStep === 1) ? <></> : <Button onClick={this.handleWizardPrevStep}>Previous Step</Button>}
            {(this.state.wizardCurrentStep === this.state.wizardStepMax) ? <></> : <Button onClick={this.handleWizardNextStep}>Next Step</Button>}
          </ModalFooter>
        </Modal>
      </>
    );
  }
}
