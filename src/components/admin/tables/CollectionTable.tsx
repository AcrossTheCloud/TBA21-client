import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import DraggableMap, { Position } from 'src/components/map/DraggableMap';

import 'src/styles/components/admin/tables/modal.scss';
import Tags, { Tag } from './Tags';

interface Collection {
  id: string;
  enabled: boolean;
  title: string;
  peopleTags: Tag[];
  markerPosition: Position;
}

interface State {
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
      let dummyPersonTags: Tag[] = [];
      for (let i = 0; i < 10; i++) {
       dummyPersonTags.push({ id: `${i}`, text: `PersonTag-${i}` });
      }

      let dummyCollections: Collection[] = [];
      for (let i = 0; i < 10; i++) {
        dummyCollections.push(
          {
            id: `${i}`,
            enabled: true,
            title: `Collection-${i}`,
            markerPosition: { lat: 150, lng: 150 },
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
            <DraggableMap positionCallback={this.DraggableMapPosition} markerPosition={this.state.markerPosition}/>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.componentModalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}
