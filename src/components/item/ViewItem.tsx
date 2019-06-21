import * as React from 'react';
import * as moment from 'moment';
import { connect } from 'react-redux';

import { getMapIcon } from '../map/icons';
import { Map, Marker, TileLayer } from 'react-leaflet';

import { fetchItem } from 'actions/items/viewItem';
import { State } from 'reducers/items/viewItem';

import { Alerts, ErrorMessage } from '../utils/alerts';

import 'leaflet/dist/leaflet.css';
import { Item } from '../../types/Item';

interface Props extends Alerts {
  fetchItem: Function;
  itemId: string;
  item: Item;
}

const MapStyle = {
  height: '300px',
  width: '800px'
};

/**
 *
 * React component, converts an Item into a friendly display.
 *
 * @param props Object, item (Item | boolean)
 */
const ItemDisplay = (props) => {
  if (Object.keys(props.item).length) {
    // Checks if the people array exists and returns a JSX element of all people.
    const
      icon = getMapIcon('jellyFish'),
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayer: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken;

    let multiMedia: boolean | JSX.Element[] = false;

    // Checks if the people array exists and returns a JSX element of all people.
    const ItemPeople = () => {
      let creators: boolean | JSX.Element[] = false;
      if (props.item.creators && props.item.creators.length > 0) {
        // Returns an Array of creators
        creators = props.item.creators.map( (creator, index) => {
          return (
            <div className="creator" key={index}>
              {creator}
            </div>
          );
        });
        return  <>People: {creators}</>;
      } else { return <></>; }
    };

    // if (props.item.urls.length > 0) {
    //   multiMedia = props.item.urls.map((url, index) => {
    //       return <MultiMedia url={url} key={index}/>;
    //   });
    // }

    // Returns a JSX element of all tags.
    const ItemTags = () => {
      if (props.item.concept_tags && props.item.concept_tags.length > 0) {
        // Returns an Array of concept_tags
        const items: JSX.Element[] = props.item.concept_tags.map( (tag, index) => {
           return (
          <div className="concept_tags" key={index}>
             {tag}
          </div>
          );
        });

        return <>Tags: {items}</>;
      } else { return <></>; }
    };

    // Returns position text and a Leaflet Map with a Marker.
    const ItemMap = () => {
      if (props.item.position && props.item.position.length > 0) {
        const markerPosition: [number, number] = [props.item.position[1], props.item.position[0]];
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
      if (props.item.timestamp) {
        let timestamp = props.item.timestamp;
        timestamp = moment.unix(timestamp).format('DD/MM/YYYY, hh:mm a');

        return (
          <div className="timestamp">
          Time: {timestamp}
          </div>
        );
      } else { return <></>; }
    };

    return (
      <div className="item" key={props.item.itemId}>
        {props.item.description ? <div>Description: {props.item.description}</div> : ''}
        {props.item.ocean ? <div>Ocean: {props.item.ocean}</div> : ''}
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

class ViewItem extends React.Component<Props, State> {
  matchedItemId: string = '';

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    // Get our itemId passed through from URL props
    if (props.match && props.match.params && props.match.params.itemId) {
      this.matchedItemId = props.match.params.itemId;
    }
  }

  componentDidMount() {
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (this.matchedItemId) {
      this.props.fetchItem(this.matchedItemId);
    } else {
      this.props.fetchItem(this.props.itemId);
    }
  }

  render() {
    if (typeof this.props.item === 'undefined') {
      return 'Loading...';
    }

    return (
      <>
        <ErrorMessage message={this.props.errorMessage} />
        <ItemDisplay item={this.props.item} />
      </>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewItem: State }) => { // tslint:disable-line: no-any
  return {
    errorMessage: state.viewItem.errorMessage,
    itemId: state.viewItem.itemId,
    item: state.viewItem.item
  };
};

// Connect our redux store State to Props, and pass through the fetchItem function.
export default connect(mapStateToProps, { fetchItem })(ViewItem);
