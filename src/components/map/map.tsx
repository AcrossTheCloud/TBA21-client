import * as React from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';

import { LocationEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { connect } from 'react-redux';

import { getMapIcon } from './icons';
import { fetchMarkers } from 'actions/map/map';

import 'styles/components/map/map.scss';
import { Item } from '../../types/Item';

interface Props {
  fetchMarkers: Function;
  markers: {
    [id: string]: MarkerData
  };
  hasError: boolean;
}

interface State {
  lat: number;
  lng: number;
  zoom: number;
  sideBarState: string;
  sideBarContent?: JSX.Element;
}
export type MarkerData = {
  position: any,  // tslint:disable-line: no-any // this is a LatLngExpression ...... [number,number]
  icon?: any, // tslint:disable-line: no-any // Optional Leaflet icon
  data: Item
};

const MapStyle = {
  width: '100%',
  height: '100%'
};

class MapView extends React.Component<Props, State> {
  map;

  state = {
    lat: -34.4282514,
    lng: 152, // Default position (Wollongong-ish)
    zoom: 7,
    sideBarState: 'closed',
    sideBarContent: <div/>,
    markers: []
  };

  componentDidMount(): void {
    this.locateUser();
    this.checkComponentHasMarkers();
  }

  checkComponentHasMarkers = (): void => {
    const hasMarkers = (this.props.markers && this.props.markers.length);

    if (!hasMarkers) {
      this.props.fetchMarkers();
    }
  }

  closeSideBar = () => {
    this.setState({sideBarState: 'closed'});
  }

  /**
   * Use leaflet's locate method to locate the use and set the view to that location.
   */
  locateUser = () => {
    this.map.leafletElement.locate()
      .on('locationfound', (location: LocationEvent) => {
        this.map.leafletElement.flyTo(location.latlng, 15);
      })
      .on('locationerror', () => {
        // Fly to a default location if the user declines our request to get their GPS location or if we had trouble getting said location.
        // Ideally the map would already be in this location anyway.
        this.map.leafletElement.flyTo([this.state.lat, this.state.lng], 10);
      });
  }

  /**
   *
   * Formats an Item into a human readable JSX and presents it nicely to the user.
   *
   * @param item {Item}
   */
  handleMarkerSideBarClick = (item: Item) => {
    const content = (
      <div className="item">
        <div className="description text-capitalize">{item.description}</div>
        <div className="tags small">
          Tags : {item.concept_tags ? item.concept_tags.toString() : ''}
        </div>
      </div>
    );

    this.setState(
      {
        sideBarState: 'open',
        sideBarContent: content
      }
    );
  }

  /**
   * Looks through our list of Markers and returns them to the Leaflet instance
   */
  MarkerList = (): JSX.Element => {
    if (!this.props.markers || !Object.keys(this.props.markers).length) { return <></>; }

    let items: JSX.Element[] = [];

    Object.entries(this.props.markers).forEach(([key, val]) => {
      items.push(
        <Marker
          key={key}
          position={val.position}
          icon={getMapIcon(val.icon)}
          onClick={() => this.handleMarkerSideBarClick(val.data)}
        />
      );
    });

    return <>{items}</>;
  }

  render() {
    const
      position: [number, number] = [this.state.lat, this.state.lng],
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayer: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken;

    return (
      <div className="mapWrapper">

        <div id="sidebar" className={this.state.sideBarState}>
          <div className="closeButton" onClick={this.closeSideBar}>X</div>
          <div className="content">
            {this.state.sideBarContent}
          </div>
        </div>

        <Map
          center={position}
          zoom={this.state.zoom}
          style={MapStyle}
          ref={map => this.map = map}
        >
          <TileLayer url={tileLayer} />
          <this.MarkerList/>
        </Map>
      </div>
    );
  }
}

const mapStateToProps = (state: { map: Props }) => ({
  markers: state.map.markers,
  hasError: state.map.hasError
});

export default connect(mapStateToProps, { fetchMarkers })(MapView);
