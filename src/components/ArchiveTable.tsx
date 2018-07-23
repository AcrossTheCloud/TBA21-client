import * as React from 'react';
import { Table } from 'reactstrap';
import { OceanObject, TableRow  } from './TableRow';
import { Form, FormGroup, Label, Input } from 'reactstrap';

import 'mapbox-gl/dist/mapbox-gl.css';

interface OceanObjectResults {
  Items: Array<OceanObject>;
  Count: number;
  ScannedCount: number;
  searchTerm: string;
}

export class ArchiveTable extends React.Component<{}, OceanObjectResults> {

  state: OceanObjectResults = {searchTerm: '', Items: [{ocean: '', timestamp: 1, itemId: '', position: [0, 0], description: '', url: '', people: [{personId: '', personName: '', role: ''}], tags: []}], Count: 1, ScannedCount: 1};

  componentDidMount() {
    fetch('https://c8rat70v4a.execute-api.ap-southeast-2.amazonaws.com/dev/items')
    .then((result: any) =>  { // tslint:disable-line:no-any
      return result.json();
    }).then((data) => {
      return data;
    })
    .then((data) => {
      this.setState(data);
    });
  }

  search(term: string) {
    this.setState({searchTerm: term});
    this.setState({Items: this.state.Items.filter(
      item => {
        if (item.ocean.toLowerCase().includes(term)) {
          return true;
        } else if (item.description.toLowerCase().includes(term)) {
          return true;
        } else if (item.tags.toString().toLowerCase().includes(term)) {
          return true;
        } else if (item.people.map(person => person.personName + person.role).toString().toLowerCase().includes(term)) {
          return true;
        } else {
          return false;
        }
      }
    )});
  }

  render() {

    return (
      <div>
        <Form>
          <FormGroup>
            <Label for="inputSearch">Search</Label>
            <Input
              id="inputSearch"
              type="text"
              value={this.state.searchTerm}
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  this.search((event.target as HTMLInputElement).value);
                }
              }}
            />
          </FormGroup>
        </Form>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Description</th>
              <th>People</th>
              <th>Tags</th>
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
      </div>
    );
  }
}
