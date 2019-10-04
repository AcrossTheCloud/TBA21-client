import * as React from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';

import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { connect } from 'react-redux';

import { getMapIcon } from './icons';
import { fetchMarkers } from 'actions/map/map';
import { openModal } from 'actions/home';

import 'styles/components/map/map.scss';
import { Item } from '../../types/Item';

interface Props {
  openModal: Function;
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
  moveEndTimeout;

  state = {
    lat: -34.4282514,
    lng: 152, // Default position (Wollongong-ish)
    zoom: 7,
    markers: []
  };

  componentDidMount(): void {
    this.locateUser();
  }

  /**
   * Use leaflet's locate method to locate the use and set the view to that location.
   */
  locateUser = () => {
    this.map.leafletElement.locate()
      .on('locationfound', (location: L.LocationEvent) => {
        this.map.leafletElement.flyTo(location.latlng, 15);
      })
      .on('locationerror', () => {
        // Fly to a default location if the user declines our request to get their GPS location or if we had trouble getting said location.
        // Ideally the map would already be in this location anyway.
        this.map.leafletElement.flyTo([this.state.lat, this.state.lng], 10);
      });
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
          onClick={() => this.props.openModal(val.data)}
        />
      );
    });

    return <>{items}</>;
  }

  getUserBounds = () => {
    const
      mapBounds = this.map.leafletElement.getBounds(),
      southWest = mapBounds._southWest,
      northEast = mapBounds._northEast;
    return {
      lat_ne: northEast.lat,
      lat_sw: southWest.lat,
      lng_ne: northEast.lng,
      lng_sw: southWest.lng
    };
  }

  /**
   *
   * If we've stopped moving wait 1 second then get more markers.
   *
   */
  moveEnd = () => {
    if (this.moveEndTimeout) {
      clearTimeout(this.moveEndTimeout);
    }

    this.moveEndTimeout = setTimeout( () => {
      this.props.fetchMarkers(this.getUserBounds());
    }, 1000);
  }

  render() {
    const
      position: [number, number] = [this.state.lat, this.state.lng],
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayer: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken;

    return (
      <div className="mapWrapper">
        <Map
          center={position}
          zoom={this.state.zoom}
          style={MapStyle}
          ref={map => this.map = map}
          onmoveend={this.moveEnd}
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

export default connect(mapStateToProps, { fetchMarkers, openModal })(MapView);
