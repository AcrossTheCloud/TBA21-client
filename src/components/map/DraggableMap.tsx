import * as React from 'react';
import { Container, Row, Col, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { getMapIcon } from './icons';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { LocationEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapState {
  position: Position | null;
  marker: Position;
  zoom: number;
}
interface MapProps {
  markerPosition?: Position | null;
}

type Position = { lat: number, lng: number };

export default class DraggableMap extends React.Component<MapProps, MapState> {

  map = React.createRef<Map>();

  state: MapState = {
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
  }

  componentDidMount(): void {
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

  getPosition = () => {
    const marker = this.refmarker.current;
    if (marker !== null) {
      return marker.leafletElement.getLatLng();
    } else {
      return false;
    }
  }

  onMapClick = (event) => {
    const map = this.map.current;
    if (map !== null) {
      const position = map.leafletElement.mouseEventToLatLng(event.originalEvent);
      console.log(map.leafletElement.mouseEventToLatLng(event.originalEvent));

      map.leafletElement.flyTo(position);
      this.setState({ marker: position });
    }
  }
  draggedMarker = () => {
    const
      marker = this.refmarker.current,
      map = this.map.current;

    if (marker !== null && map !== null) {
      const position = marker.leafletElement.getLatLng();

      map.leafletElement.flyTo(position);
      this.setState({
        marker: position,
      });
    }
  }
  latInputChange = () => {
    const map = this.map.current;
    if (map !== null) {
      this.setState(
        {
          marker: {...this.state.marker, lat: this.latInputRef.value},
        },
        () => {
          map.leafletElement.flyTo(this.state.marker);
        });
    }
  }
  lngInputChange = () => {
    const map = this.map.current;
    if (map !== null) {
      this.setState(
        {
          marker: {...this.state.marker, lng: this.lngInputRef.value},
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
    const map = this.map.current;
    if (map !== null) {
      map.leafletElement.locate()
        .on('locationfound', (location: LocationEvent) => {
          map.leafletElement.flyTo(location.latlng, 15);
          this.setState({marker: location.latlng});
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
        margin: '30px'
      };

    return (
      <React.Fragment>
        <Container>
          <Row>
            <Col md="6">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lat</InputGroupAddon>
                <Input type="number" value={this.state.marker.lat} innerRef={(el) => { this.latInputRef = el; }} onChange={this.latInputChange}/>
              </InputGroup>
            </Col>
            <Col md="6">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lng</InputGroupAddon>
                <Input type="number" value={this.state.marker.lng} innerRef={(el) => { this.lngInputRef = el; }} onChange={this.lngInputChange}/>
              </InputGroup>
            </Col>
          </Row>
        </Container>

        <Map
          center={position}
          zoom={this.state.zoom}
          style={mapStyle}
          ref={this.map}
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
      </React.Fragment>
    );
  }
}
