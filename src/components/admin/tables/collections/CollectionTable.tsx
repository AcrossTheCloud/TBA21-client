import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { API } from 'aws-amplify';

import { TitleAndDescription } from 'components/admin/tables/TitleAndDescription';
import DraggableMap from 'components/map/DraggableMap';
import { Position } from 'types/Map';

import 'styles/components/admin/tables/modal.scss';
import { Alerts, ErrorMessage } from '../../../utils/alerts';
import { Collection } from '../../../../types/Collection';

interface State extends Alerts {
  wizardCurrentStep: number;
  wizardStepMax: number;

  collections: Collection[];
  tableIsLoading: boolean;
  componentModalOpen: boolean;

  rowEditingId: string | undefined;
  geojson: string | undefined;

  title: string;
  description?: string;
}

export default class CollectionTable extends React.Component<{}, State> {
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
      collections: [],
      rowEditingId: undefined,
      geojson: undefined,

      title: ''
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

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    // Get list of collections
    this.getCollections();
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  getCollections = async (): Promise<void> => {
    try {
      const response = await API.get('tba21', 'admin/collections/get', {});

      if (!this._isMounted) { return; }
      this.setState({collections: response.collections, tableIsLoading: false});
    } catch (e) {

      if (!this._isMounted) { return; }
      this.setState({collections: [], errorMessage: `We've had some trouble getting the list of collections`, tableIsLoading: false});
    }
  }

  onEditButtonClick = (row: Collection) => {
    this.setState(
      {
        wizardCurrentStep: 1,
        componentModalOpen: true,
        rowEditingId: row.id,
        geojson: row.geojson
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

  DraggableMapPosition = (markerPos: Position) => {
    console.log(markerPos.lat, markerPos.lng);
  }

  /**
   *  Sets the title and description from TitleAndDescription callback.
   * @param title { string }
   * @param description { string }
   */
  callbackTitleDescription = (title: string, description: string) => {
    if (!this._isMounted) { return; }

    this.setState({
      title: title,
      description: description
    });
  }

  Wizard = (props) => {
    if (!this._isMounted) { return <></>; }

    switch (props.step) {
      case 1 :
        return <DraggableMap positionCallback={this.DraggableMapPosition} geojson={this.state.geojson}/>;
      case 2 :
        return <TitleAndDescription callback={this.callbackTitleDescription} title={this.state.title} description={this.state.description} />;

      default:
        return <></>;
    }
  }

  handleWizardNextStep = () => {
    let stepNumber = this.state.wizardCurrentStep;
    stepNumber++;
    this.setState({ wizardCurrentStep: stepNumber });
  }
  handleWizardPrevStep = () => {
    let stepNumber = this.state.wizardCurrentStep;
    stepNumber--;
    this.setState({ wizardCurrentStep: stepNumber });
  }

  render() {
    return (
      <>
        <ErrorMessage message={this.state.errorMessage}/>

        <BootstrapTable
          remote
          bootstrap4
          className="collectionTable"
          keyField="id"
          data={this.state.tableIsLoading ? [] : this.state.collections}
          columns={this.tableColumns}
          onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
          noDataIndication={() => !this.state.tableIsLoading && !this.state.collections.length ? 'No data to display.' : <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
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
