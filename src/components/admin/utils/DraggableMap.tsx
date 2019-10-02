import * as React from 'react';
import { Container, Row, Col, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Map, Marker, TileLayer, Polyline } from 'react-leaflet';
import { LatLngExpression, LocationEvent } from 'leaflet';

import { getMapIcon } from '../../map/icons';
import { Position } from 'types/Map';

import 'leaflet/dist/leaflet.css';

interface State {
  position: LatLngExpression;
  marker: Position | undefined;
  mode: 'marker' | 'lineString';
  lineString: LatLngExpression[] | undefined;
  zoom: number;
}

interface Props {
  geojson: string | undefined;
  positionCallback?: Function;
}

export default class DraggableMap extends React.Component<Props, State> {
  _isMounted;
  map;

  state: State = {
    position: [0, 0],
    zoom: 13,
    lineString: undefined,
    mode: 'marker',
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

    if (this.props.geojson) {
      const
        geoJSON = JSON.parse(this.props.geojson),
        { type }: { type: string } = geoJSON;

      if (type === 'Point') {
        const { coordinates }: { coordinates: LatLngExpression } = geoJSON;
        this.setState({
          mode: 'marker',
          marker: { lat: coordinates[0], lng: coordinates[1]},
          position: [coordinates[0], coordinates[1]]
        });
      } else if (type === 'LineString') {
        const { coordinates }: { coordinates: LatLngExpression[] } = geoJSON;
        this.setState({
          marker: undefined,
          mode: 'lineString',
          lineString: coordinates,
          position: [coordinates[0][0], coordinates[0][1]]
        });

      }
    } else {
      if (this.state.position === null) {
        this.locateUser();
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (this.state.marker !== prevState.marker || this.state.lineString !== prevState.lineString) {
      this.callback();
    }
  }

  callback = () => {
    if (typeof this.props.positionCallback === 'function') {
      if (this.state.mode === 'marker') {
        this.props.positionCallback(this.state.marker);
      } else if (this.state.mode === 'lineString') {
        this.props.positionCallback(this.state.lineString);
      }
    }
  }

  componentWillUnmount(): void {
    this.callback();
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

    if (map !== null && this._isMounted && this.state.mode === 'marker') {
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
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayer: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,

      mapStyle = {
        height: '100%',
        minHeight: '400px'
      };

    return (
      <div id="draggableMap" className="h-100">
        {this.state.mode === 'marker' && this.state.marker ?
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
        :
          <></>
        }

        <Map
          center={this.state.position}
          zoom={this.state.zoom}
          style={mapStyle}
          ref={map => this.map = map}
          onclick={this.onMapClick}
        >
          <TileLayer
            url={tileLayer}
          />

          {this.state.mode === 'lineString' && this.state.lineString ?
            <Polyline color="lime" positions={this.state.lineString} />
            :
            <></>
          }

          {this.state.mode === 'marker' && this.state.marker ?
            <Marker
              draggable={true}
              position={this.state.marker}
              ref={this.refmarker}
              ondragend={this.draggedMarker}
              icon={getMapIcon()}
            />
          :
            <></>
          }
        </Map>
      </div>
    );
  }
}
