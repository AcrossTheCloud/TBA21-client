import * as React from 'react';
import { connect } from 'react-redux';

import { Container, Row, Col, Input, InputGroup, InputGroupAddon, Button, UncontrolledPopover, PopoverBody } from 'reactstrap';
import { isEqual } from 'lodash';

import * as topojson from 'topojson-client';
import { GeoJsonObject } from 'geojson';

import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import './VerticalRangeSlider.scss';
import './Map.scss';

import { OALogo } from 'components/map/utils/icons';

import 'styles/components/_dropzone.scss';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster';

import { colourScale } from '../../map/utils/colorScale';
import { Alerts, ErrorMessage } from '../../utils/alerts';

import { initialiseMap } from '../../map/utils/initialiseMap';
import { initialiseMarkerCluster } from '../../map/utils/initialiseMarkerCluster';
import { locateUser } from '../../map/utils/locateUser';

import { toggleOverlay } from '../../../actions/loadingOverlay';

const toGeoJSON = require('@mapbox/togeojson');

interface State extends Alerts {
  zoom: number;
  inputLat: number;
  inputLng: number;
  typedLat: string;
  typedLng: string;
}

interface Props {
  toggleOverlay: Function;
  topoJSON?: any;  // tslint:disable-line: no-any
  onChange?: Function;
  collectionItems?: GeoJsonObject;
}

const mapStyle = {
  width: '100%',
  height: '100%'
};

function isLatitude(lat) {
  return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLongitude(lng) {
  return isFinite(lng) && Math.abs(lng) <= 180;
}

class Map extends React.Component<Props, State> {
  _isMounted;
  map;
  topoLayer;
  markerClusterLayer;
  ignoredTopoLayer; // A layer of pmIgnore data

  uploadInputRef;

  inputLngTimeout;
  inputLatTimeout;

  manualLatLngInputOnChange; // Timeout for manual input change of lat and lng on marker/vertex

  state: State = {
    zoom: 5, // initial zoom level

    inputLat: 0,
    inputLng: 0,
    typedLat: "0",
    typedLng: "0"
  };

  constructor(props: Props) {
    super(props);

    this._isMounted = false;
    this.topoExtension();
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    this.map = await initialiseMap();

    this.markerClusterLayer = initialiseMarkerCluster(this.map);
    if (this.map) {

      // Creates a pane for the pop content
      this.map.createPane('controlPopUp', document.getElementById('mapWrapper'));

      this.addLeafletGeoMan();
      this.topoLayer = this.setupTopoLayer();

      const topo = this.props.topoJSON;
      if (topo && topo.objects && topo.objects.output.geometries && topo.objects.output.geometries.length) {
        const geometries = topo.objects.output.geometries;
        if ((geometries[0].type === null || geometries[0].type === 'null') && geometries.length === 1) {
          this.locate();
        } else {
          this.props.toggleOverlay(true);
          setTimeout( () => this.topoLayer.addData(this.props.topoJSON), 500);
        }
      } else {
        this.locate();
      }
      // If we're a collection disable all of the items on the map, so they're no editable.
      if (this.props.collectionItems) {
        // Add our items data in an ignored layer.
        this.ignoredTopoLayer = this.setupTopoLayer(true);
        setTimeout( () => this.ignoredTopoLayer.addData(this.props.collectionItems), 500);
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

  /**
   * Locates the user and updates the position in state.
   */
  locate = () => {
    locateUser(this.map, undefined, (data: {inputLng: number, inputLat: number}) => {
      if (this._isMounted) {
        const {inputLng, inputLat} = data;
        this.setState({inputLng, inputLat});
      }
    });
  }

  setupTopoLayer = (isIgnored: boolean = false): L.GeoJSON => {
    const map = this.map;
    // const OALogoIcon = OALogo();
    let mapLayer = !isIgnored ? this.topoLayer : this.ignoredTopoLayer;

    const options = {
      // // Add our custom marker to points.
      // pointToLayer: (feature: Feature<GeometryObject>, latlng: L.LatLngExpression) => {
      //   return L.marker(latlng, {icon: OALogoIcon});
      // }
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
        addData: function(data: any, upload: 'kml' | 'gpx') {  // tslint:disable-line: no-any
          const points: L.Layer[] = [];

          if (data.type === 'Topology') {
            data.objects.output.geometries.forEach((geometryCollection, index: number) => {
              if (geometryCollection && geometryCollection.geometries) {
                geometryCollection.geometries.forEach(feature => {
                  if (feature.type !== null) {

                    // Remove empty properties as we don't care about them.
                    if (feature.properties) {
                      delete feature.properties;
                    }

                    if (feature.type === 'Point') {
                      if (feature.coordinates) {
                        const latLng = new L.LatLng(feature.coordinates[1], feature.coordinates[0], feature.coordinates[2] ? feature.coordinates[2] : 0);
                        const markerLayer: L.Marker = L.marker(latLng, {icon: OALogo(feature.coordinates[2])});
                        _self.layerEvents(markerLayer);
                        points.push(markerLayer);
                      }
                    } else {
                      // Convert the feature to geoJSON for leaflet
                      const geojson = topojson.feature(data, feature);
                      L.GeoJSON.prototype.addData.call(this, geojson);
                    }
                  }
                });
              }
            });
          } else {
            // We're sending through just GeoJSON data not Topo, Leaflet lovesss it so we don't need to do anything.
            if (upload) {
              data.features.forEach( (feature, index) => {
                // Remove empty properties as we don't care about them.
                if (feature.properties) {
                  delete feature.properties;
                }
                if (feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates.length) {
                  feature.geometry.coordinates = feature.geometry.coordinates.map(x => {
                    if (!x) { return false; }

                    // If we don't have a Z level, add it
                    if (x.length === 2) {
                      x.push(0);
                    }
                    return x;
                  });
                }

                if (feature.geometry && feature.geometry.type === 'Point') {
                  if (feature.geometry.coordinates) {
                    const { coordinates } = feature.geometry;
                    const latLng = new L.LatLng(coordinates[1], coordinates[0], coordinates[2] ? coordinates[2] : 0);
                    const markerLayer: L.Marker = L.marker(latLng, {icon: OALogo(coordinates[2])});
                    points.push(markerLayer);
                  }
                } else {
                  L.GeoJSON.prototype.addData.call(this, feature);
                }

                if ((index + 1) === data.features.length) {
                  _self.props.toggleOverlay(false);
                }
              });

              setTimeout(() => _self.callback(), 500);
            } else {
              L.GeoJSON.prototype.addData.call(this, data);
            }
          }

          if (points.length) {
            _self.markerClusterLayer.addLayers(points);
          }

          _self.props.toggleOverlay(false);
          // Fit the map to the bounds of the loaded content.
          setTimeout(() => _self.mapLayerFitBounds(_self.topoLayer), 500);
        }
      }
    );
  }

  callback = () => {
    if (this.topoLayer && typeof this.props.onChange === 'function') {
      const topoLayerJSON = this.topoLayer.toGeoJSON();
      const markerClusterJSON = this.markerClusterLayer.toGeoJSON();

      if (markerClusterJSON.features.length) {
        topoLayerJSON.features.push(...markerClusterJSON.features);
      }
      this.props.onChange(topoLayerJSON);
    }
  }

  layerEvents = (layer: L.Layer) => {
    layer.on('pm:edit', l => {
      this.callback();
    });
    layer.on('pm:cut', l => {
      this.callback();
    });
  }

  mapLayerFitBounds = (layer: L.FeatureGroup) => {
    // Fit the map to the bounds of the loaded content.
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    }
  }

  mapEvents = () => {
    const map = this.map;

    map.on('moveend', e => {
      if (this._isMounted) {
        const center = this.map.getCenter().wrap();
        if (center.lat && center.lng) {
          this.setState({
            inputLng: center.lng,
            inputLat: center.lat,
            typedLng: center.lng.toString(),
            typedLat: center.lat.toString()
          });
        }
      }
    });

    // listen to vertexes being added to currently drawn layer
    map.on('pm:drawstart', w => {
      const workingLayer = w.workingLayer;

      // Add the altitude to the coords to any vertex's, this includes Linestrings and Poly.
      workingLayer.on('pm:vertexadded', e => {

        const markerLatLng = e.marker._latlng;
        const index = workingLayer._latlngs.indexOf(markerLatLng);
        workingLayer._latlngs[index] = this.addAltToLatLng(workingLayer._latlngs[index]); // add a 0 level z index

        this.controlPopUp(workingLayer, e.marker, index);
      });
    });

    // On create of a new polyline/polygon/marker
    map.on('pm:create', e => {
      this.topoLayer.addLayer(e.layer);
      this.layerEvents(e.layer);

      // Add the altitude to the coords to the Marker
      if (e.shape === 'Marker') {
        e.layer._latlng = this.addAltToLatLng(e.layer._latlng); // add a 0 level z index
        this.controlPopUp(e.layer, e.marker);
      }

      this.callback();
    });

    map.on('pm:edit', e => {
      this.controlPopUp(e.layer, e.marker);
    });

    map.on('pm:remove', u => {
      this.topoLayer.removeLayer(u.layer);
      this.callback();
    });
  }

  addAltToLatLng(coords: L.LatLng, alt: number = 0): L.LatLng {
    return new L.LatLng(coords.lat, coords.lng, alt);
  }

  controlPopUp = (workingLayer, marker: L.Marker, index?: number) => {
    const div = document.createElement('div');
    div.className = 'container p-0';

    div.append(this.manualLatLngInputs(workingLayer, marker, index));
    div.append(this.logScaleControls(workingLayer, marker, index));

    const popup = new L.Popup(
      {
        pane: 'controlPopUp',
        className : 'fixed',
        maxWidth: 500,
        minWidth: 450,
        autoPan: false,
        autoClose: true,
        closeOnClick: true
      }
    ).setContent(div);

    marker.bindPopup(popup);
    marker.openPopup();
  }

  manualLatLngInputs = (workingLayer, marker: L.Marker, index?: number): HTMLElement => {
    const _self = this;
    const markerLatLng: L.LatLng = marker.getLatLng(); // the current vertex/marker that we've added

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="col-12 p-0 mb-2">Manually enter coordinates:</div>`;
    wrapper.className = 'manual-input-wrapper mb-2 border-bottom';

    function createInputLayout(type: 'lat' | 'lng'): HTMLElement {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group row';

      const labelField = document.createElement('label');
      labelField.htmlFor = type + 'Input';
      labelField.className = 'col-sm-2 col-form-label';
      labelField.innerHTML = type === 'lat' ? 'Latitude' : 'Longitude';
      formGroup.append(labelField);

      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'col-sm-10';

      const inputField = document.createElement('input');
      inputField.id = type + 'Input';
      inputField.className = 'form-control form-control-sm mb-2';
      inputField.type = 'number';
      inputField.value = markerLatLng[type].toString();
      inputWrapper.append(inputField);
      formGroup.append(inputWrapper);

      inputField.addEventListener('input', () => {
        clearTimeout(_self.manualLatLngInputOnChange);
        if (inputField.classList.contains('error')) {
          inputField.classList.remove('error');
        }

        if (type === 'lat' && !isLatitude(inputField.value)) {
          inputField.classList.add('error');
          return;
        } else if (!isLongitude(inputField.value)) {
          inputField.classList.add('error');
          return;
        } else {
          onChange(type, parseFloat(inputField.value));
        }
      }, true);

      return formGroup;
    };

    const latInput = createInputLayout('lat');
    const lngInput = createInputLayout('lng');

    function onChange(type: 'lat' | 'lng', value: number) {
      _self.manualLatLngInputOnChange = setTimeout(function() {
        const alt = markerLatLng.alt ? markerLatLng.alt : 0;

        if (type === 'lat') {
          markerLatLng.lat = value;
        } else {
          markerLatLng.lng = value;
        }

        marker.setLatLng(markerLatLng);

        // Update the working layer's LatLng(s)
        if (typeof index === 'undefined') {
          workingLayer.setLatLng(_self.addAltToLatLng(markerLatLng, alt));
        } else {
          // Get all LatLngs and set the LatLngExpressions of the indexed one
          const latlngs = workingLayer.getLatLngs();
          latlngs[index] = _self.addAltToLatLng(markerLatLng, alt);
          workingLayer.setLatLngs(latlngs);
        }
        _self.map.panTo(markerLatLng);
        _self.callback();
      }, 500);
    }

    wrapper.append(latInput);
    wrapper.append(lngInput);

    return wrapper;
  }

  logScaleControls = (workingLayer, marker, index?: number): HTMLElement => {
    const markerLatLng: L.LatLng = marker._latlng; // the current vertex/marker that we've added
    const zLevel = markerLatLng[2] ? (markerLatLng[2] * 1852) : 0; // convert the pointers Nautical Mile Alt to Meters

    const div = document.createElement('div');
    div.className = 'row';
    div.innerHTML = `<div class="col-12">Depth (m):</div>`;

    const col = document.createElement('div');
    col.className = 'col-6';

    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';

    const sliderInput = document.createElement('input');
    sliderInput.id = 'range-slider';
    sliderInput.className = 'fluid-slider';
    sliderInput.type = 'range';
    sliderInput.value = zLevel.toString();
    sliderInput.min = '0';
    sliderInput.max = '10000';

    const sliderLabel = document.createElement('span');
    sliderLabel.id = 'range-label';
    sliderLabel.className = 'range-label';

    sliderWrapper.append(sliderInput);
    sliderWrapper.append(sliderLabel);
    col.append(sliderWrapper);

    const _self = this;

    function sliderOnChange() {
      const
        sliderValue = sliderInput.value,
        parsedSliderValue = parseInt(sliderValue, 0),
        colour = colourScale(parsedSliderValue);

      // Update the working layer's LatLng(s)
      const convertToNauticalMile = (parsedSliderValue / 1852);
      if (typeof index === 'undefined') {
        workingLayer.setLatLng(_self.addAltToLatLng(markerLatLng, -Math.abs(convertToNauticalMile)));
      } else {
        // Get all LatLngs and set the LatLngExpressions of the indexed one
        const latlngs = workingLayer.getLatLngs();
        latlngs[index] = _self.addAltToLatLng(markerLatLng, -Math.abs(parsedSliderValue));
        workingLayer.setLatLngs(latlngs);
      }
      _self.callback();

      sliderLabel.innerHTML = sliderValue;
      sliderLabel.style.backgroundColor = '#' + colour.colour;
      const labelPosition = (parsedSliderValue / parseInt(sliderInput.max, 0));

      if (sliderValue === sliderInput.min) {
        sliderLabel.style.left = ((labelPosition * 100) + 2) + '%';
      } else if (sliderValue === sliderInput.max) {
        sliderLabel.style.left = ((labelPosition * 100) - 2) + '%';
      } else {
        sliderLabel.style.left = (labelPosition * 100) + '%';
      }
    }

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'col-6';
    const manualInput = document.createElement('input');
    manualInput.className = 'form-control form-control-sm';
    manualInput.type = 'number';
    manualInput.value = zLevel.toString();
    manualInput.min = '0';
    manualInput.max = '10000';

    inputWrapper.append(manualInput);
    div.append(inputWrapper);

    sliderInput.addEventListener('input', () => { manualInput.value = sliderInput.value; sliderOnChange(); }, true);
    manualInput.addEventListener('input', () => { sliderInput.value = manualInput.value; sliderOnChange(); }, true);

    div.append(col);

    return div;
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
        icon: OALogo()
      }
    });
    map.pm.disableDraw('Marker');

    this.mapEvents();
  }

  setLatLng = (type: 'inputLat' | 'inputLng') => {
    const map = this.map;
    const inputValue = (type === 'inputLat') ? this.state.typedLat : this.state.typedLng;
    if (map !== null && this._isMounted) {
      const value = parseFloat(inputValue);
      let timeout = type === 'inputLat' ? this.inputLatTimeout : this.inputLngTimeout;
      clearTimeout(timeout);

      const state = {};
      Object.assign(state, { [type]: !isNaN(value) ? value : this.state[type] });
      this.setState(state, () => {
        timeout = setTimeout(() => {
          map.flyTo({ lat: this.state.inputLat, lng: this.state.inputLng });
        }, 300);
      });
    }
  }

  fileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {  // tslint:disable-line:no-any
    const files: FileList | null = e.target.files;

    if (!files) { return; }

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

    for (let i = 0; i < files.length; i++) {

      let fileType = files[i].name.includes('.kml') ? 'kml' : files[i].name.includes('.gpx') ? 'gpx' : null;

      if (fileType !== null) {
        fileContents(files[i], result => {
          try {
            this.props.toggleOverlay(true);
            const geoJSON = fileType === 'kml' ? toGeoJSON.kml(result) : toGeoJSON.gpx(result);
            if (geoJSON) {
              this.topoLayer.addData(geoJSON, fileType);
            }
          } catch (e) {
            console.log('error', e);
            this.props.toggleOverlay(false);
            this.setState({ errorMessage: `Looks like we've had an issue with your ${fileType === 'kml' ? 'KML' : 'GPX'} file.`});
          }
        });
      }
    }

    e.target.value = '';
  }

  render(): React.ReactNode {
    const isIPad = navigator.userAgent.match(/iPad/i) || 'standalone' in navigator;
    return (
      <div id="draggableMap" className={`h-100 ${isIPad ? 'ipad' : ''}`}>
        <ErrorMessage message={this.state.errorMessage}/>
        <Container>
          <Row className="pb-1 align-items-center">
            <Col md="3" className="px-0">
              <input
                type="file"
                onChange={this.fileUpload}
                style={{display: 'none'}}
                ref={e => this.uploadInputRef = e}
              />
              <Button id="fileupload" size="small" color="primary" onClick={e => this.uploadInputRef.click()}>
                Upload a GPX or KML file.
              </Button>
              <UncontrolledPopover trigger="hover" placement="bottom" target="fileupload">
                <PopoverBody>
                  <div className="py-1">Upload a GPX or KML file.</div>
                </PopoverBody>
              </UncontrolledPopover>
            </Col>
            <Col md="4">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lat</InputGroupAddon>
                <Input className="lat" type="text" value={this.state.typedLat.toString()} onChange={e => this.setState({'typedLat': e.target.value})} onKeyPress={e => {if (e.key==='Enter') { this.setLatLng('inputLat') }}}/>
              </InputGroup>
            </Col>
            <Col md="4">
              <InputGroup>
                <InputGroupAddon addonType="prepend">Lng</InputGroupAddon>
                <Input className="lng" type="text" value={this.state.typedLng.toString()} onChange={e => this.setState({'typedLng': e.target.value})} onKeyPress={e => { if (e.key==='Enter') { this.setLatLng('inputLng') }}}/>
              </InputGroup>
            </Col>
          </Row>
        </Container>
        <Container>
          <Row>
            <Col xs="12" className="px-0">
              <div className="mapWrapper" id="mapWrapper">
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

export default connect(undefined, { toggleOverlay })(Map);
