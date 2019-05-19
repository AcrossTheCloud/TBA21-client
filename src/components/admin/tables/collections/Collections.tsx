import * as React from 'react';
import CollectionTable from './CollectionTable';
import { Container } from 'reactstrap';

export default class Collections extends React.Component {
  render() {
    return (
      <Container id="collectionTable">
        <CollectionTable />
      </Container>
    );
  }
}
