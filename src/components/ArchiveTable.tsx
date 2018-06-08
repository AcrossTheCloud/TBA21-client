import * as React from 'react';
import { Table } from 'reactstrap';
import * as $ from 'jquery';

interface OceanObject {
  Items: Array<any>; // tslint:disable-line: no-any
}

export class ArchiveTable extends React.Component<{}, {}> {

  getDataFromServer(ocean: String) {

    $.getJSON('https://4xgacg5y8f.execute-api.eu-central-1.amazonaws.com/prod/items?ocean=' + ocean)
    .done(function(data: OceanObject) {
      $('#itemsTable').html('');
      $('#itemsTable').append('<table><thead><tr><th>#</th><th>ocean</th><th>description</th><th>artefact URL</th></tr></thead>');
      $.each((data as any).Items as any[], function(i: number, item: any) { // tslint:disable-line: no-any
        $('#itemsTable').append('<tr><td>' + item.itemId + '</td><td>' + item.description + '</td><td><a href="' + item.url + '">' + item.url + '</a></td></tr>');
      });
      $('#itemsTable').append('</table>');
    });
  }

  componentDidMount() {
    this.getDataFromServer('Pacific');
  }

  render() {
    return (
      <Table striped id="itemsTable" />
    );
  }
}
