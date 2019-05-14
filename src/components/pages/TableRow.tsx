import * as React from 'react';
import { MultiMedia } from 'src/components/utils/MultiMedia';

export interface Person {
  personId: string;
  personName: string;
  roles: string[];
}

interface Urls {
  urls: string[];
}

export interface OceanObject {
  ocean: string;
  timestamp: number;
  itemId: string;
  position: number[];
  description: string;
  urls: Array<string>;
  people: Array<Person>;
  tags: Array<string>;
}

export const RenderPeople = (props: { people: Array<Person> }): JSX.Element => {
  if (!props.people) { return <></>; }

  return (
    <>
      {
        props.people.reduce(
        (accumulator: string, currentPerson: Person) => {
          return (accumulator + currentPerson.personName + ': ' + currentPerson.roles.toString().replace(',', ', ') + '; ');
        },
        '').slice(0, -2)
      }
    </>
  );
};

export class Items extends React.Component<Urls, {}> {
  render() {
    console.log(this.props); // tslint:disable-line: no-console
    return (
      this.props.urls.map((item: string) => {return (<MultiMedia url={item} key={item} />); })
    );
  }
}

export class TableRow extends React.Component<OceanObject, {}> {
  render() {
    return (
      <tr>
        <td>{this.props.description}</td>
        <td><RenderPeople people={this.props.people} /></td>
        <td>{this.props.tags ? this.props.tags.toString() : ''}</td>
        <td vertical-align="top"><Items urls={this.props.urls} /></td>
      </tr>
    );
  }
}
