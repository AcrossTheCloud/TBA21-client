import * as React from 'react';
import { Table } from 'reactstrap';
import { OceanObject, TableRow  } from './TableRow';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { API } from 'aws-amplify';

import 'mapbox-gl/dist/mapbox-gl.css';

interface OceanObjectResults {
  Items: Array<OceanObject>;
  SearchedItems: Array<OceanObject>;
  Count: number;
  ScannedCount: number;
  searchTerm: string;
}

export class ArchiveTable extends React.Component<{}, OceanObjectResults> {

  state: OceanObjectResults = {searchTerm: '',
   Items: [{ocean: '', timestamp: 1, itemId: '', position: [0, 0], description: '', url: '', people: [{personId: '', personName: '', roles: ['']}], tags: []}],
   SearchedItems: [{ocean: '', timestamp: 1, itemId: '', position: [0, 0], description: '', url: '', people: [{personId: '', personName: '', roles: ['']}], tags: []}],
   Count: 1, ScannedCount: 1};

  componentDidMount() {
    API.get('tba21', 'items', {})
      .then((data: any) => { // tslint:disable-line: no-any
        this.setState(data);
        this.setState({SearchedItems: this.state.Items});
      }).catch((e: any ) => { // tslint:disable-line: no-any
      });

  }

  search(term: string) {
    this.setState({searchTerm: term});
    this.setState({SearchedItems: this.state.Items.filter(
      item => {
        if (item.ocean.toLowerCase().includes(term)) {
          return true;
        } else if (item.description.toLowerCase().includes(term)) {
          return true;
        } else if (item.tags.toString().toLowerCase().includes(term)) {
          return true;
        } else if (item.people.map(person => person.personName + person.roles.toString()).toString().toLowerCase().includes(term)) {
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
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  event.preventDefault(); // Let's stop this event.
                  event.stopPropagation();
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
            {(this.state.SearchedItems).map(item => {
              console.log(item); // tslint:disable-line:no-console
              return <TableRow key={item.itemId} {...item} />;
            })}
          </tbody>
        </Table>
      </div>
    );
  }
}
