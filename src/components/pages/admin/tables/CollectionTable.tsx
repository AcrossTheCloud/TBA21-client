import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Spinner } from 'reactstrap';

interface State {
  isLoading: boolean;
  collections: string;
}

export default class CollectionTable extends React.Component<{}, State> {
  tableColumns;

  constructor(props: {}) {
    super(props);

    this.state = {
      isLoading: true,
      collections: ''
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

  async componentDidMount(): Promise<void> {
    // Get list of collections
  }

  render() {
    return (
      <BootstrapTable
        bootstrap4
        className="userListTable"
        keyField="username"
        data={this.state.isLoading ? [] : this.state.collections}
        columns={this.tableColumns}
        onTableChange={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
        noDataIndication={() => <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" />}
      />
    );
  }
}
