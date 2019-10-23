import * as React from 'react';
import { Container, Row, Col, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { isEqual } from 'lodash';
import { Map, TileLayer } from 'react-leaflet';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { jellyFish } from 'components/map/icons';

import 'leaflet/dist/leaflet.css';
import { Layer } from 'leaflet';
import * as topojson from 'topojson-client';
import { Feature, GeoJsonObject, GeometryObject } from 'geojson';

interface State {
  position: L.LatLngExpression;
  zoom: number;
  inputLat: number;
  inputLng: number;
}

interface Props {
  topoJSON?: GeoJsonObject;
  onChange?: Function;
  collectionItems?: GeoJsonObject;
}

export default class DraggableMap extends React.Component<Props, State> {
  _isMounted;
  map;
  topoLayer;
  ignoredTopoLayer; // A layer of pmIgnore data

  state: State = {
    position: [0, 0],
    zoom: 5, // initial zoom level

    inputLat: 0,
    inputLng: 0
  };

  latInputRef;
  lngInputRef;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;
    this.topoExtension();
  }

  componentDidMount(): void {
    this._isMounted = true;
    this.locateUser();

    this.addLeafletGeoMan();
    this.topoLayer = this.setupTopoLayer();

    if (this.props.topoJSON && Object.keys(this.props.topoJSON).length) {
      console.log('this.props.topoJSON', this.props.topoJSON); // todo-dan remove
      this.topoLayer.addData(this.props.topoJSON);
    }
    // If we're a collection disable all of the items on the map, so they're no editable.
    if (this.props.collectionItems) {
      // Add our items data in an ignored layer.
      this.ignoredTopoLayer = this.setupTopoLayer(true);
      this.ignoredTopoLayer.addData(this.props.collectionItems);
    }
  }
  componentWillUnmount(): void {
    this.callback();
    this._isMounted = false;
  }
  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (!isEqual(prevProps.topoJSON, this.props.topoJSON)) {
      this.topoLayer.addData(this.props.topoJSON);
    }

    // Add our items data in an ignored layer.
    if (this.ignoredTopoLayer && this.props.collectionItems && !isEqual(prevProps.collectionItems, this.props.collectionItems)) {
      this.ignoredTopoLayer.addData(this.props.collectionItems);
    }

  }

  setupTopoLayer = (isIgnored: boolean = false): L.GeoJSON => {
    const map = this.map.leafletElement;
    const jellyFishIcon = jellyFish();
    let mapLayer = !isIgnored ? this.topoLayer : this.ignoredTopoLayer;

    const options = {
      // Add our custom marker to points.
      pointToLayer: (feature: Feature<GeometryObject>, latlng: L.LatLngExpression) => {
        return L.marker(latlng, {icon: jellyFishIcon});
      },
      // Each feature style it up
      onEachFeature: (feature: Feature<GeometryObject>, layer: L.Layer) => {
        if (layer instanceof L.Polyline) {
          layer.setStyle({ color: '#948fff' });
        }
      }
    };

    // Add the Geoman pmIgnore option to the layer
    if (isIgnored) {
      Object.assign(options, { pmIgnore: true });
    }

    // @ts-ignore
    mapLayer = new L.TopoJSON(null, options);
    mapLayer.addTo(map);

    return mapLayer;
  }

  topoExtension() {
    // @ts-ignore
    // Leaflet extension for TopoJSON, we ignore this as TS has a spaz
    L.TopoJSON = L.GeoJSON.extend(
      {
        // When any data is added we need to get the geometries from the output
        // We technically un-nest each "feature" (line string) out of the collection it comes in, this makes styling it a hell of a lot easier.
        addData: function(data: any) {  // tslint:disable-line: no-any
          if (data.type === 'Topology') {
            data.objects.output.geometries.forEach((geometryCollection, index: number) => {
              if (geometryCollection && geometryCollection.geometries) {
                geometryCollection.geometries.forEach(feature => {
                  // Add the properties to the feature, these are in the top level collection.
                  // Object.assign(feature, { properties: data.objects.output.geometries[index].properties});

                  // Convert the feature to geoJSON for leaflet
                  const geojson = topojson.feature(data, feature);
                  L.GeoJSON.prototype.addData.call(this, geojson);
                });
              }
            });
          }
        }
      }
    );
  }

  callback = () => {
    if (this.topoLayer && typeof this.props.onChange === 'function') {
      this.props.onChange(this.topoLayer.toGeoJSON());
    }
  }

  layerEvents = (layer: Layer) => {
    layer.on({
      'pm:edit': () => {
        console.log('pm:edit');
        this.callback();
      },
      'pm:cut': () => {
        console.log('pm:cut');
        this.callback();
      }
      });
  }

  addAltToLatLng(coords: L.LatLng, alt: number = 3000): L.LatLng {
    return new L.LatLng(coords.lat, coords.lng, alt);
  }

  mapEvents = () => {
    const map = this.map.leafletElement;

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    map.on('pm:drawstart', w => {
      const workingLayer = w.workingLayer;

      // Add the altitude to the coords to any vertex's, this includes Linestrings and Poly.
      workingLayer.on('pm:vertexadded', e => {
        console.log('pm:vertexadded', e);

        let latlng = e.marker._latlng;
        let index = workingLayer._latlngs.indexOf(latlng);

        workingLayer._latlngs[index] = this.addAltToLatLng(e.latlng);
        console.log(workingLayer._latlngs, latlng, index);
      });
    });

    map.on('pm:create', e => {
      this.topoLayer.addLayer(e.layer);
      this.layerEvents(e.layer);

      // Add the altitude to the coords to the Marker
      if (e.shape === 'Marker') {
        e.layer._latlng = this.addAltToLatLng(e.layer._latlng);
      }

      console.log('pm:create', e);
      this.callback();
    });

    map.on('pm:remove', u => {
      console.log('pm:remove');
      this.topoLayer.removeLayer(u.layer);
      this.callback();
    });
  }

  /**
   * Add controls from leaflet geoman, leaflet.pm
   */
  addLeafletGeoMan = () => {
    const map = this.map.leafletElement;
    map.pm.addControls(
      {
        drawCircle: false,
        drawCircleMarker: false,
        drawRectangle: false
      }
    );

    // Enable marker, set the icon then disable it, this toggles the "clicked" state on the icon.
    map.pm.enableDraw('Marker', {
      markerStyle: {
        icon: jellyFish()
      }
    });
    map.pm.disableDraw('Marker');

    this.mapEvents();
  }

  latInputChange = () => {
    const map = this.map.leafletElement;
    if (map !== null) {
      this.setState({ inputLat: this.latInputRef.value }, () => {
        map.flyTo({ lat: this.state.inputLat, lng: this.state.inputLng });
      });
    }
  }
  lngInputChange = () => {
    const map = this.map.leafletElement;
    if (map !== null) {
      this.setState({ inputLng: this.lngInputRef.value }, () => {
        map.flyTo({ lat: this.state.inputLat, lng: this.state.inputLng });
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
        .on('locationfound', (location: L.LocationEvent) => {
          if (location && location.latlng) {
            map.leafletElement.flyTo(location.latlng, 10);
            // Set the input fields
            this.latInputRef.value = location.latlng.lat;
            this.lngInputRef.value = location.latlng.lng;
          }
        })
        .on('locationerror', () => {
          // Fly to a default location if the user declines our request to get their GPS location or if we had trouble getting said location.
          // Ideally the map would already be in this location anyway.
          // Set the input fields
          this.latInputRef.value = this.state.position[0];
          this.lngInputRef.value = this.state.position[1];
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
        <Container>
          <Row>
            <Col md="6">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lat</InputGroupAddon>
                <Input className="lat" type="number" innerRef={(el) => { this.latInputRef = el; }} onChange={this.latInputChange}/>
              </InputGroup>
            </Col>
            <Col md="6">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lng</InputGroupAddon>
                <Input className="lng" type="number" innerRef={(el) => { this.lngInputRef = el; }} onChange={this.lngInputChange}/>
              </InputGroup>
            </Col>
          </Row>
        </Container>

        <div className="mapWrapper">
          <Map
            center={this.state.position}
            zoom={this.state.zoom}
            style={mapStyle}
            ref={map => this.map = map}
          >
            <TileLayer url={tileLayer} />
          </Map>
        </div>
      </div>
    );
  }
}
