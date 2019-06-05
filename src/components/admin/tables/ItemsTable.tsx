import { API } from 'aws-amplify';

import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import DraggableMap from 'components/map/DraggableMap';
import { FileUpload } from './FileUpload';

import { Item } from 'types/Item';
import { Position } from 'types/Map';

import { Alerts } from 'components/utils/alerts';
import { TitleAndDescription } from 'components/admin/tables/utils/TitleAndDescription';

import 'styles/components/admin/tables/modal.scss';

interface State extends Alerts {
  wizardCurrentStep: number;
  wizardStepMax: number;

  items: Item[];
  tableIsLoading: boolean;
  componentModalOpen: boolean;
  rowEditingId: number | undefined;
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
      tableIsLoading: true,
      items: [],
      rowEditingId: undefined
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

  getItems = async (): Promise<void> => {
    try {
      const response = await API.get('tba21', 'admin/items/get', {});

      if (!this._isMounted) { return; }
      this.setState({items: response.items, tableIsLoading: false});
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
        return <DraggableMap positionCallback={this.DraggableMapPosition} geojson={this.state.rowEditingId ? this.state.items[this.state.rowEditingId].geojson : ''}/>

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

  render() {
    return (
      <>
        <BootstrapTable
          remote
          bootstrap4
          className="itemTable"
          keyField="id"
          data={this.state.tableIsLoading ? [] : this.state.items}
          columns={this.tableColumns}
          onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
          noDataIndication={() => !this.state.tableIsLoading && !this.state.items.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
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
