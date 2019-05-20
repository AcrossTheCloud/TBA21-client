import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import DraggableMap, { Position } from 'components/map/DraggableMap';
import Tags from '../Tags';
import { FileUpload } from '../FileUpload';

import { Item } from 'types/Item';

import 'styles/components/admin/tables/modal.scss';

interface State {
  wizardCurrentStep: number;
  wizardStepMax: number;

  items: Item[];
  tableIsLoading: boolean;
  componentModalOpen: boolean;
  rowEditingId: string | undefined;

  markerPosition: Position | undefined;
}

export default class ItemsTable extends React.Component<{}, State> {
  tableColumns;

  constructor(props: {}) {
    super(props);

    this.state = {
      wizardCurrentStep: 1,
      wizardStepMax: 5,

      componentModalOpen: false,
      tableIsLoading: true,
      items: [],
      rowEditingId: undefined,
      markerPosition: undefined
    };

    this.tableColumns = [
      {
        dataField: 'id',
        hidden: true
      },
      {
        dataField: 'enabled',
        hidden: true
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
        dataField: 'People',
        text: 'People',
        formatter: (e, row, rowIndex) => {
          return (
            <>
              <Tags tags={row.peopleTags} />
            </>
          );
        },
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            console.log(row, row.tagHOC.state);
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

  onEditButtonClick = (row: Item) => {
    this.setState(
{
        componentModalOpen: true,
        // rowEditingId: row.id,
        // markerPosition: row.markerPosition
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

  Wizard = (props) => {
    switch (props.step) {
      case 1 :
        return <DraggableMap positionCallback={this.DraggableMapPosition} markerPosition={this.state.markerPosition}/>;
      case 2 :
        return <FileUpload />;

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
          bootstrap4
          className="itemTable"
          keyField="id"
          data={this.state.tableIsLoading ? [] : this.state.items}
          columns={this.tableColumns}
          onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
          noDataIndication={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
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
