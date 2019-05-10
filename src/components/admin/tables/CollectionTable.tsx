import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Button, Modal, ModalBody, ModalFooter, Spinner } from 'reactstrap';

import DraggableMap from 'src/components/map/DraggableMap';

interface Collection {
  id: string;
  enabled: boolean;
  title: string;
}

interface State {
  collections: Collection[];
  tableIsLoading: boolean;
  componentModalOpen: boolean;
}

export default class CollectionTable extends React.Component<{}, State> {
  tableColumns;

  draggableMap;

  constructor(props: {}) {
    super(props);

    this.draggableMap = React.createRef<DraggableMap>();

    this.state = {
      componentModalOpen: false,
      tableIsLoading: true,
      collections: []
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
        text: 'Title'
      }
    ];
  }

  // todo-dan REMOVE ths testing dummy data function.
  testing() {

    setTimeout(() => {
      let dummyCollections: Collection[] = [];
      for (let i = 0; i < 10; i++) {
        dummyCollections.push({ id: `${i}`, enabled: true, title: `Collection-${i}` });
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

  componentModalToggle = () => {
    this.setState( prevState => ({
      ...prevState,
      componentModalOpen: !prevState.componentModalOpen
      })
    );
  }

  onRowClick = (e: React.MouseEvent, row: Collection, rowIndex: number) => {
    console.log(e, row, rowIndex);
    this.setState({ componentModalOpen: true });
  }

  render() {
    const rowEvents = {
      onClick: this.onRowClick
    };

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
          rowEvents={rowEvents}
        />

        <Modal isOpen={this.state.componentModalOpen}>
          <ModalBody>
            <DraggableMap ref={this.draggableMap} />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.componentModalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}
