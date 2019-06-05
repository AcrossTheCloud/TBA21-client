import * as React from 'react';
import ItemsTable from '../../tables/ItemsTable';
import { Container } from 'reactstrap';

export default class Items extends React.Component {
  render() {
    return (
      <Container id="itemsTable">
        <ItemsTable />
      </Container>
    );
  }
}
