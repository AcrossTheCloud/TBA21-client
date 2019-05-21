import * as React from 'react';
import { Container, Row, Col, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { LocationEvent } from 'leaflet';
import { isEqual } from 'lodash';

import { getMapIcon } from './icons';
import { Position } from 'types/Map';

import 'leaflet/dist/leaflet.css';

interface State {
  position: Position | null;
  marker: Position;
  zoom: number;
}

interface Props {
  markerPosition?: Position | null;
  positionCallback?: Function;
}

export default class DraggableMap extends React.Component<Props, State> {
  _isMounted;
  map;

  state: State = {
    position: null,
    zoom: 13,
    marker: {
      lat: 51.505,
      lng: -0.09,
    }
  };

  refmarker = React.createRef<Marker>();
  latInputRef;
  lngInputRef;

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this._isMounted = false;
  }

  componentDidMount(): void {
    this._isMounted = true;

    if (this.props.markerPosition) {
      this.setState({
        marker: this.props.markerPosition,
        position: this.props.markerPosition
      });
    } else {
      if (this.state.position === null) {
        this.locateUser();
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (typeof this.props.positionCallback === 'function') {

      // If the marker position object isn't the same as the Previous State or Marker Position given to us in props, don't run this.
      if (!isEqual(prevState.marker, this.state.marker) && !isEqual(this.state.marker, this.props.markerPosition)) {
        this.props.positionCallback(this.state.marker);
      }
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  getPosition = () => {
    const marker = this.refmarker.current;
    if (marker !== null) {
      return marker.leafletElement.getLatLng();
    } else {
      return false;
    }
  }

  onMapClick = (event) => {
    const map = this.map;
    if (map !== null && this._isMounted) {
      const position = map.leafletElement.mouseEventToLatLng(event.originalEvent);

      map.leafletElement.flyTo(position);
      this.setState({ marker: position });
    }
  }

  draggedMarker = () => {
    const
      marker = this.refmarker.current,
      map = this.map;

    if (marker !== null && map !== null && this._isMounted) {
      const position = marker.leafletElement.getLatLng();

      map.leafletElement.flyTo(position);
      this.setState({
        marker: position,
      });
    }
  }

  inputChange = () => {
    const map = this.map;
    if (map !== null && this._isMounted) {
      this.setState(
        {
          marker: {lat: parseFloat(this.latInputRef.value), lng: parseFloat(this.lngInputRef.value)},
        },
        () => {
          map.leafletElement.flyTo(this.state.marker);
        });
    }
  }

  /**
   * Use leaflet's locate method to locate the use and set the view to that location.
   */
  locateUser = (): void => {
    const map = this.map;
    if (map !== null && this._isMounted) {
      map.leafletElement.locate()
        .on('locationfound', (location: LocationEvent) => {
          console.log('locateUser data', location);
          if (location && location.latlng) {
            map.leafletElement.flyTo(location.latlng, 15);
            this.setState({marker: location.latlng});
          }
        })
        .on('locationerror', () => {
          // Fly to a default location if the user declines our request to get their GPS location or if we had trouble getting said location.
          // Ideally the map would already be in this location anyway.
          map.leafletElement.flyTo([1, 1], 10);
          this.setState({marker: {lat: 1, lng: 1}});
        });
    }
  }

  render(): React.ReactNode {
    const
      position: [number, number] = (this.state.position !== null ? [this.state.position.lat, this.state.position.lng] : [1, 1]),
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayer: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,

      mapStyle = {
        height: '100%',
        minHeight: '400px',
        margin: '30px 15px'
      };

    return (
      <div id="draggableMap">
        <Container>
          <Row>
            <Col md="6">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lat</InputGroupAddon>
                <Input className="lat" type="number" value={this.state.marker.lat} innerRef={(el) => { this.latInputRef = el; }} onChange={this.inputChange}/>
              </InputGroup>
            </Col>
            <Col md="6">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lng</InputGroupAddon>
                <Input className="lng" type="number" value={this.state.marker.lng} innerRef={(el) => { this.lngInputRef = el; }} onChange={this.inputChange}/>
              </InputGroup>
            </Col>
          </Row>
        </Container>

        <Map
          center={position}
          zoom={this.state.zoom}
          style={mapStyle}
          ref={map => this.map = map}
          onclick={this.onMapClick}
        >
          <TileLayer
            url={tileLayer}
          />
          <Marker
            draggable={true}
            position={this.state.marker}
            ref={this.refmarker}
            ondragend={this.draggedMarker}
            icon={getMapIcon()}
          />
        </Map>
      </div>
    );
  }
}
