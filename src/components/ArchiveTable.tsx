import * as React from 'react';
import { Table } from 'reactstrap';
import { OceanObject, TableRow  } from './TableRow';

import 'mapbox-gl/dist/mapbox-gl.css';

interface OceanObjectResults {
  Items: Array<OceanObject>;
  Count: number;
  ScannedCount: number;
}

export class ArchiveTable extends React.Component<{}, OceanObjectResults> {

  state: OceanObjectResults = {Items: [{ocean: '', timestamp: 1, itemId: '', position: [0, 0], description: '', url: '', artist: ''}], Count: 1, ScannedCount: 1};

  componentDidMount() {
    fetch('https://tba21-api.acrossthecloud.net/items')
    .then((result: any) =>  { // tslint:disable-line:no-any
      return result.json();
    }).then((data) => {
      this.setState(data);
    });
  }

  render() {

    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Description</th>
            <th>Artist</th>
            <th>Artifact</th>
            <th>Map</th>
          </tr>
        </thead>
        <tbody>
          {(this.state.Items).map(item => {
            console.log(item); // tslint:disable-line:no-console
            return <TableRow key={item.itemId} {...item} />;
          })}
        </tbody>
      </Table>
    );
  }
}
