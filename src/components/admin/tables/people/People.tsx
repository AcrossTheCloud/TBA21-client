import * as React from 'react';
import PeopleTable from './PeopleTable';
import { Container } from 'reactstrap';

export default class People extends React.Component {
  render() {
    return (
      <Container id="peopleTable">
        <PeopleTable />
      </Container>
    );
  }
}
