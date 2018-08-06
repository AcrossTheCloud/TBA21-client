import * as React from 'react';
import { StaticMap } from 'react-map-gl';
import * as MapboxGL from 'mapbox-gl';
import { MultiMedia } from './MultiMedia';

interface MyMapProps {
  lng: number;
  lat: number;
}

class MyRowMap extends React.Component<MyMapProps, {}> {

  map: MapboxGL.Map;

  render() {
    return (
      <div>
        <StaticMap
          mapboxApiAccessToken="pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ"
          width={200}
          height={200}
          longitude={this.props.lng}
          latitude={this.props.lat}
          zoom={6}
        />
      </div>
    );
  }

}

export interface Person {
  personId: string;
  personName: string;
  roles: string[];
}

export interface OceanObject {
  ocean: string;
  timestamp: number;
  itemId: string;
  position: number[];
  description: string;
  url: string;
  people: Array<Person>;
  tags: Array<string>;
}

const renderPeople = function (people: Array<Person>) {
  return people.reduce(
    (accumulator: string, currentPerson: Person) => {
      return (accumulator + currentPerson.personName + ': ' + currentPerson.roles.toString().replace(',', ', ') + '; ');
    },
    '').slice(0, -2);
};

export class TableRow extends React.Component<OceanObject, {}> {
  render() {
    return (
      <tr>
        <td>{this.props.description}</td>
        <td>{renderPeople(this.props.people)}</td>
        <td>{this.props.tags ? this.props.tags.toString() : ''}</td>
        <td vertical-align="top"><MultiMedia url={this.props.url} /></td>
        <td><MyRowMap lng={this.props.position[0]} lat={this.props.position[1]} /></td>
      </tr>
    );
  }
}
