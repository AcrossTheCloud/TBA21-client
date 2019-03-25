import * as React from 'react';
import { API } from 'aws-amplify';
import * as moment from 'moment';
import Alert from 'reactstrap/lib/Alert';
import { Map, Marker, TileLayer } from 'react-leaflet';

import { OceanObject } from './TableRow';
import { cancelablePromise, appendPendingPromise, removePendingPromise } from 'src/components/utils/CancelablePromise';

import { MultiMedia } from 'src/components/utils/MultiMedia';
import { getMapIcon } from './map/icons';

import 'leaflet/dist/leaflet.css';

interface Props {
  itemId: string;
}

interface State {
  itemId: string | boolean;
  itemInformation: OceanObject | boolean;
  error: boolean;
}

const MapStyle = {
  height: '300px',
  width: '800px'
};

/**
 * 
 * React component, converts an OceanObject into a friendly display.
 * 
 * @param props Object, itemInformation (OceanObject | boolean) 
 */
const Item = (props) => { 
  if (Object.keys(props.itemInformation).length > 0) {
    const 
      icon = getMapIcon('jellyFish'),
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayer: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken;
    
    let multiMedia: boolean | Array<JSX.Element> = false;

    // Checks if the people array exists and returns a JSX element of all people.
    const ItemPeople = () => {
        let people: boolean | Array<JSX.Element> = false;
        if (props.itemInformation.people && props.itemInformation.people.length > 0) {
          // Returns an Array of people
          people = props.itemInformation.people.map( (person, index) => {
            return (
              <div className="person" key={index}>
                {person.personName}
              </div>
            );
          });
          return  <>People: {people}</>;
        } else { return <></>; } 
    }; 
   
    // returns Multimedia component
    if (props.itemInformation.urls.length > 0) {
      multiMedia = props.itemInformation.urls.map((url, index) => {
          return <MultiMedia url={url} key={index}/>;
      }); 
    }
    
    // Returns a JSX element of all tags.
    const ItemTags = () => {
      if (props.itemInformation.tags && props.itemInformation.tags.length > 0) {
        // Returns an Array of tags
        const items: Array<JSX.Element> = props.itemInformation.tags.map( (tag, index) => {
           return (
            <div className="tag" key={index}>
              {tag}
            </div>
          );
        }); 

        return <>Tags: {items}</>;
      } else { return <></>; } 
    };
    
    // Returns position text and a Leaflet Map with a Marker.
    const ItemMap = () => {
      if (props.itemInformation.position && props.itemInformation.position.length > 0) {
        const markerPosition: [number, number] = [props.itemInformation.position[1], props.itemInformation.position[0]];
        return (
          <>
            Position: {markerPosition[0]},{markerPosition[1]}
            <Map center={markerPosition} zoom={7} style={MapStyle}>
              <TileLayer
                url={tileLayer}
              />
              <Marker icon={icon} position={markerPosition}/>
            </Map>
          </>
        );
      } else { return <></>; }
    };

    // Checks for a timestamp, converts it to human friendly text and returns the result.
    const ItemDate = () => {
      if (props.itemInformation.timestamp) {
        let timestamp = props.itemInformation.timestamp;
        timestamp = moment.unix(timestamp).format('DD/MM/YYYY, hh:mm a');
        
        return (
          <div className="timestamp">
            Time: {timestamp} 
          </div>
        );
      } else { return <></>; }
    };

    return (
      <div className="item" key={props.itemInformation.itemId}>
        {props.itemInformation.description ? <div>Description: {props.itemInformation.description}</div> : ''}
        {props.itemInformation.ocean ? <div>Ocean: {props.itemInformation.ocean}</div> : ''}
        {ItemDate()}
        {ItemPeople()}
        {ItemTags()}
        {multiMedia ? multiMedia : ''}
        {ItemMap()}
      </div>
    );
  } else {
    return <></>;
  }
};

/**
 * Returns A bootstrap Alert if true.
 * 
 * @param props Object, error (boolean)
 */
const ErrorMessage = (props) => {
  if (props.error) {
    return <Alert color="danger">Oops</Alert>;
  } else {
    return <></>;
  }
};

export default class ViewItem extends React.Component<Props, State> {
    pendingPromises: any = []; // tslint:disable-line: no-any
  
    constructor(props: any) { // tslint:disable-line: no-any
      super(props);

      let itemId = false;
      if (props.match && props.match.params && props.match.params.itemId) {
        // api call
        itemId = props.match.params.itemId;
      }

      this.state = {
        itemId: itemId,
        itemInformation: false,
        error: false
      };
    }

    componentDidMount() {
      if (this.state.itemId) {

        // Does an API call to find an item by itemId
        const wrappedPromise = cancelablePromise(API.get('tba21', 'items', {
          queryStringParameters : {
            itemId: this.state.itemId
          }
        }));
        appendPendingPromise(this, wrappedPromise);
  
        // Wrap the promise.
        wrappedPromise.promise
          .then((data: any) => { // tslint:disable-line: no-any
            if (data) {
              this.setState( {itemInformation: data} );
            } else {
              this.setState( {itemInformation: false} );
              this.setState( {error: true} );
            }
          })
          .then(() => {
            removePendingPromise(this, wrappedPromise);
          })
          .catch((e: any) => { // tslint:disable-line: no-any
            removePendingPromise(this, wrappedPromise);
            this.setState( {error: true} );
          });
      } else {
        this.setState( {itemInformation: false} );
      }
 
    }

    render() {
        return (
          <>
            <ErrorMessage error={this.state.error} />
            <Item itemInformation={this.state.itemInformation} />
          </>
        );
    }
}