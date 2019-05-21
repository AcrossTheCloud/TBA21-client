import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import DraggableMap, { Position } from 'components/map/DraggableMap';
import Tags, { Tag } from '../Tags';

import 'styles/components/admin/tables/modal.scss';

interface Collection {
  id: string;
  enabled: boolean;
  title: string;
  peopleTags: Tag[];
  markerPosition: Position | undefined;
}

interface State {
  wizardCurrentStep: number;
  wizardStepMax: number;

  collections: Collection[];
  tableIsLoading: boolean;
  componentModalOpen: boolean;
  rowEditingId: string | undefined;

  markerPosition: Position | undefined;
}

export default class CollectionTable extends React.Component<{}, State> {
  tableColumns;

  constructor(props: {}) {
    super(props);

    this.state = {
      wizardCurrentStep: 1,
      wizardStepMax: 5,

      componentModalOpen: false,
      tableIsLoading: true,
      collections: [],
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

  // todo-dan REMOVE ths testing dummy data function.
  testing() {

    setTimeout(() => {
      let dummyCollections: Collection[] = [];
      for (let i = 0; i < 10; i++) {

        let dummyPersonTags: Tag[] = [];
        for (let t = 0; t < 10; t++) {
          dummyPersonTags.push({ id: `${i}-${t}`, text: `PersonTag-${t}` });
        }

        dummyCollections.push(
          {
            id: `${i}`,
            enabled: true,
            title: `Collection-${i}`,
            markerPosition: undefined,
            peopleTags: [
              dummyPersonTags[Math.floor(Math.random() * dummyPersonTags.length)],
              dummyPersonTags[Math.floor(Math.random() * dummyPersonTags.length)],
              dummyPersonTags[Math.floor(Math.random() * dummyPersonTags.length)],
              dummyPersonTags[Math.floor(Math.random() * dummyPersonTags.length)]
            ] // random pick
          }
        );
      }

      this.setState({
        tableIsLoading: false,
        collections: dummyCollections
      });
    },
               2000);
  }

  async componentDidMount(): Promise<void> {
    // Get list of collections

    this.testing(); // todo-dan -remove

  }

  onEditButtonClick = (row: Collection) => {
    this.setState(
{
        componentModalOpen: true,
        rowEditingId: row.id,
        markerPosition: row.markerPosition
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
        return <></>;

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
          className="collectionTable"
          keyField="id"
          data={this.state.tableIsLoading ? [] : this.state.collections}
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