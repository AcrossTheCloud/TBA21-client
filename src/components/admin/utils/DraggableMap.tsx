import * as React from 'react';
import { Container, Row, Col, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { isEqual } from 'lodash';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import './VerticalRangeSlider.scss';

import { jellyFish } from 'components/map/icons';

import 'leaflet/dist/leaflet.css';
import { Layer } from 'leaflet';
import * as topojson from 'topojson-client';
import { Feature, GeoJsonObject, GeometryObject } from 'geojson';
import { colourScale } from '../../map/colorScale';
import Dropzone from 'react-dropzone';
import { Alerts, ErrorMessage } from '../../utils/alerts';

import 'styles/components/_dropzone.scss';

const toGeoJSON = require('@mapbox/togeojson');

interface State extends Alerts {
  position: L.LatLngExpression;
  zoom: number;
  inputLat: number;
  inputLng: number;
}

interface Props {
  topoJSON?: any;  // tslint:disable-line: no-any
  onChange?: Function;
  collectionItems?: GeoJsonObject;
}

const mapStyle = {
  width: '100%',
  height: '100%'
};

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
    this.initialiseMap();
    if (this.map) {
      this.addLeafletGeoMan();
      this.topoLayer = this.setupTopoLayer();

      const topo = this.props.topoJSON;
      if (topo && topo.objects && topo.objects.output.geometries && topo.objects.output.geometries.length) {
        const geometries = topo.objects.output.geometries;
        if ((geometries[0].type === null || geometries[0].type === 'null') && geometries.length === 1) {
          this.locateUser();
        } else {
          this.topoLayer.addData(this.props.topoJSON);
        }
      } else {
        this.locateUser();
      }
      // If we're a collection disable all of the items on the map, so they're no editable.
      if (this.props.collectionItems) {
        // Add our items data in an ignored layer.
        this.ignoredTopoLayer = this.setupTopoLayer(true);
        this.ignoredTopoLayer.addData(this.props.collectionItems);
      }
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

  initialiseMap = () => {
    const
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayerURL: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken;

    this.map = L.map('oa_map', {
      maxZoom: 18,
      zoom: 5,
      preferCanvas: true
    }).setView([this.state.inputLat, this.state.inputLng], 13);

    L.tileLayer(tileLayerURL, {
      attribution: '',
      maxZoom: 18,
      id: mapID,
      accessToken: accessToken
    }).addTo(this.map);
  }

  setupTopoLayer = (isIgnored: boolean = false): L.GeoJSON => {
    const map = this.map;
    const jellyFishIcon = jellyFish();
    let mapLayer = !isIgnored ? this.topoLayer : this.ignoredTopoLayer;

    const options = {
      // Add our custom marker to points.
      pointToLayer: (feature: Feature<GeometryObject>, latlng: L.LatLngExpression) => {
        return L.marker(latlng, {icon: jellyFishIcon});
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

  topoExtension = () => {
    const _self = this;
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
                  if (feature.type !== null) {
                    // Add the properties to the feature, these are in the top level collection.
                    // Object.assign(feature, { properties: data.objects.output.geometries[index].properties});

                    // Convert the feature to geoJSON for leaflet
                    const geojson = topojson.feature(data, feature);
                    L.GeoJSON.prototype.addData.call(this, geojson);
                  }
                });
              }
            });

            // Fit the map to the bounds of the loaded content.
            const bounds = _self.topoLayer.getBounds();
            if (bounds.isValid()) {
              _self.map.fitBounds(bounds);
            }
          } else {
            // We're sending through just GeoJSON data not Topo, Leaflet lovesss it so we don't need to do anything.
            L.GeoJSON.prototype.addData.call(this, data);
          }
        }
      }
    );
  }

  callback = () => {
    if (this.topoLayer && typeof this.props.onChange === 'function') {
      console.log(this.topoLayer.toGeoJSON());
      this.props.onChange(this.topoLayer.toGeoJSON());
    }
  }

  layerEvents = (layer: Layer) => {
    layer.on({
      'pm:edit': l => {
        console.log('Layer pm:edit', l);
        this.callback();
      },
      'pm:cut': () => {
        console.log('pm:cut');
        this.callback();
      }
    });
  }

  mapEvents = () => {
    const map = this.map;

    // listen to vertexes being added to currently drawn layer
    map.on('pm:drawstart', w => {
      const workingLayer = w.workingLayer;

      // Add the altitude to the coords to any vertex's, this includes Linestrings and Poly.
      workingLayer.on('pm:vertexadded', e => {
        console.log('pm:vertexadded', e);

        const markerLatLng = e.marker._latlng;
        const index = workingLayer._latlngs.indexOf(markerLatLng);
        workingLayer._latlngs[index] = this.addAltToLatLng(workingLayer._latlngs[index]); // add a 0 level z index

        this.logScalePopUp(workingLayer, e.marker, index);
      });
    });

    // On create of a new polyline/polygon/marker
    map.on('pm:create', e => {
      this.topoLayer.addLayer(e.layer);
      this.layerEvents(e.layer);

      // Add the altitude to the coords to the Marker
      if (e.shape === 'Marker') {
        e.layer._latlng = this.addAltToLatLng(e.layer._latlng); // add a 0 level z index
        this.logScalePopUp(e.layer, e.marker);
      }

      console.log('pm:create', e);
      this.callback();
    });

    map.on('pm:edit', e => {
      this.logScalePopUp(e.layer, e.marker);
      console.log('pm:edit', e);
    });

    map.on('pm:remove', u => {
      console.log('pm:remove');
      this.topoLayer.removeLayer(u.layer);
      this.callback();
    });
  }

  addAltToLatLng(coords: L.LatLng, alt: number = 0): L.LatLng {
    return new L.LatLng(coords.lat, coords.lng, alt);
  }

  logScalePopUp = (workingLayer, marker, index?: number) => {
    const div = document.createElement('div');
    div.innerHTML = `<div>Depth :</div>`;

    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';
    const sliderInput = document.createElement('input');
    sliderInput.id = 'range-slider';
    sliderInput.className = 'fluid-slider';
    sliderInput.type = 'range';
    sliderInput.value = '0';
    sliderInput.min = '0';
    sliderInput.max = '10000';

    const sliderLabel = document.createElement('span');
    sliderLabel.id = 'range-label';
    sliderLabel.className = 'range-label';

    const _self = this;
    let markerLatLng = marker._latlng; // the current vertex that we've added

    function sliderOnChange() {
      const
        sliderValue = sliderInput.value,
        parsedSliderValue = parseInt(sliderValue, 0);

      // Update the working layer's LatLng(s)
      if (typeof index === 'undefined') {
        workingLayer.setLatLng(_self.addAltToLatLng(markerLatLng, -Math.abs(parsedSliderValue)));
      } else {
        // Get all LatLngs and set the LatLngExpressions of the indexed one
        const latlngs = workingLayer.getLatLngs();
        latlngs[index] = _self.addAltToLatLng(markerLatLng, -Math.abs(parsedSliderValue));
        workingLayer.setLatLngs(latlngs);
      }
      _self.callback();

      sliderLabel.innerHTML = sliderValue;
      sliderLabel.style.backgroundColor = '#' + colourScale(parsedSliderValue).colour;
      const labelPosition = (parseInt(sliderValue, 0) / parseInt(sliderInput.max, 0));

      if (sliderValue === sliderInput.min) {
        sliderLabel.style.left = ((labelPosition * 100) + 2) + '%';
      } else if (sliderValue === sliderInput.max) {
        sliderLabel.style.left = ((labelPosition * 100) - 2) + '%';
      } else {
        sliderLabel.style.left = (labelPosition * 100) + '%';
      }
    }

    const manualInput = document.createElement('input');
    manualInput.type = 'number';
    manualInput.value = '0';
    manualInput.min = '0';
    manualInput.max = '10000';

    sliderInput.addEventListener('input', () => { manualInput.value = sliderInput.value; sliderOnChange(); }, true);
    manualInput.addEventListener('input', () => { sliderInput.value = manualInput.value; sliderOnChange(); }, true);

    sliderWrapper.append(sliderInput);
    sliderWrapper.append(sliderLabel);
    div.append(manualInput);
    div.append(sliderWrapper);

    marker.bindPopup(div, { 'className' : 'logScalePopUp' });
    marker.openPopup();
  }
  /**
   * Add controls from leaflet geoman, leaflet.pm
   */
  addLeafletGeoMan = () => {
    const map = this.map;
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
    const map = this.map;
    if (map !== null) {
      this.setState({ inputLat: this.latInputRef.value }, () => {
        map.flyTo({ lat: this.state.inputLat, lng: this.state.inputLng });
      });
    }
  }
  lngInputChange = () => {
    const map = this.map;
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
    map.locate()
      .on('locationfound', (location: L.LocationEvent) => {
        if (location && location.latlng) {
          map.flyTo(location.latlng, 8);
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

  fileUpload = async (acceptedFiles: Array<any>, rejectedFiles: any) => {  // tslint:disable-line:no-any
    const fileContents = (file: File, callback: Function) => {
      const reader = new FileReader();
      reader.onload = function () {
        if (this.result && typeof this.result === 'string') {
          const parsed = (new DOMParser()).parseFromString(this.result, 'text/xml');
          callback(parsed);
        }
      };
      reader.readAsText(file);
    };

    const addLayerAndFlyTo = geoJSON => {
      this.topoLayer.addData(geoJSON);

      this.map.fitWorld();
    };

    for (const file of acceptedFiles) {
      let fileType = file.name.includes('.kml') ? 'kml' : file.name.includes('.gpx') ? 'gpx' : null;

      if (fileType !== null) {
        fileContents(file, result => {
          try {
            const geoJSON = fileType === 'kml' ? toGeoJSON.kml(result) : toGeoJSON.gpx(result);
            if (geoJSON) {
              addLayerAndFlyTo(geoJSON);
            }
          } catch (e) {
            console.log(e);
            this.setState({ errorMessage: `Looks like we've had an issue with your ${fileType === 'kml' ? 'KML' : 'GPX'} file.`});
          }
        });
      }
    }
  }

  render(): React.ReactNode {
    return (
      <div id="draggableMap" className="h-100">
        <ErrorMessage message={this.state.errorMessage}/>
        <Container>
          <Row>
            <Col className="dropzone_wrapper">
              <Dropzone
                onDrop={this.fileUpload}
              >
                {({getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept}) => (
                  <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    {!isDragActive && 'Click here or drop a gpx/kml file to add location data.'}
                    {isDragReject && 'File type not accepted, sorry!'}
                    {isDragAccept && 'Drop!'}
                  </div>
                )}
              </Dropzone>
            </Col>
          </Row>
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
        <Container>
          <Row>
            <Col xs="12">
              <div className="mapWrapper">
                <div
                  id="oa_map"
                  style={mapStyle}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
