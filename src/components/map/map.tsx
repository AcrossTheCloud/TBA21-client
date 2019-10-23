import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual, findIndex } from 'lodash';

import * as topojson from 'topojson-client';

import { CSSTransition } from 'react-transition-group';

import { Feature, GeoJsonObject, GeometryObject } from 'geojson';
import { jellyFish } from './icons';
import { Map, TileLayer } from 'react-leaflet';

import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import LeafletSearch from 'leaflet-search';
import 'leaflet-search/dist/leaflet-search.min.css';

import { fetchData, openModal } from 'actions/map/map';

import 'animate.css/animate.min.css';
import 'styles/components/map/map.scss';
import { legend } from './controls/legend';
import { colourScale } from './colorScale';

interface Props {
  openModal: Function;
  fetchData: Function;
  hasError: boolean;
  data: GeoJsonObject;
}

interface State {
  lat: number;
  lng: number;
  zoom: number;

  zoomedOutTooFar: boolean;
}
const MapStyle = {
  width: '100%',
  height: '100%'
};

class MapView extends React.Component<Props, State> {
  map;
  topoLayer;
  loadedData: object[] = [];
  moveEndTimeout;
  _isMounted: boolean = false;

  state = {
    lat: -34.4282514,
    lng: 152, // Default position (Wollongong-ish)
    zoom: 7,
    zoomedOutTooFar: false
  };

  componentDidMount(): void {
    this._isMounted = true;
    const map = this.map.leafletElement;
    const self = this;

    // Lets attempt to find the user.
    this.locateUser();

    legend(this.map.leafletElement);

    // @ts-ignore
    // Leaflet extension for TopoJSON, we ignore this as TS has a spaz
    L.TopoJSON = L.GeoJSON.extend(
      {
        // Overwrite the addData function.
        addData: function(data: any) {  // tslint:disable-line: no-any
          if (data.type === 'Topology') {
            // When any data is added we need to get the geometries from the output
            // We technically un-nest each "feature" (line string) out of the collection it comes in, this makes styling it a hell of a lot easier.
            data.objects.output.geometries.forEach((geometryCollection, index: number) => {
              if (geometryCollection && geometryCollection.geometries) {
                geometryCollection.geometries.forEach((feature, featureIndex: number) => {
                  // Add the properties to the feature, these are in the top level collection.
                  Object.assign(feature, {properties: data.objects.output.geometries[index].properties});

                  // Convert the feature to geoJSON for leaflet
                  const geojson = topojson.feature(data, feature);

                  // If our loaded data array doesn't contain the feature, push it in
                  if (findIndex(self.loadedData, geometryCollection.geometries[featureIndex]) === -1) {
                    // Push out feature to an array so we can check if we've already loaded it (above)
                    self.loadedData.push(geometryCollection.geometries[featureIndex]);

                    // return the original extension call.
                    L.GeoJSON.prototype.addData.call(this, geojson);
                  }
                });
              }
            });
          }
        }
      }
    );

    // @ts-ignore
    this.topoLayer = new L.TopoJSON(null, {
      // Add our custom marker to points.
      pointToLayer: (feature: Feature<GeometryObject>, latlng: L.LatLng) => {
        console.log(feature, latlng)
        return new L.Marker(latlng, {icon: jellyFish(latlng.alt)});
      },
      // Each feature style it up
      onEachFeature: (feature: Feature<GeometryObject>, layer: L.Layer) => {
        if (layer instanceof L.Polygon) {
          const latlngs = layer.getLatLngs() as L.LatLng[][];
          const altitudes: number[] = latlngs[0].map(e => e.alt ? e.alt : 0);
          const maxZLevel = Math.max(...altitudes);

          this.polygonLayerStyle(maxZLevel, layer);
        } else if (layer instanceof L.Polyline) {
          const latlngs = layer.getLatLngs() as L.LatLng[];
          const altitudes: number[] = latlngs.map(e => e.alt ? e.alt : 0);
          const maxZLevel = Math.max(...altitudes);

          layer.setStyle({ color: colourScale(maxZLevel).colour });
        }

        // If we have properties (we always should) set our custom tool tip.
        if (!!feature.properties) {
          const toolTip = `
          <div>
            <div class="title">
              ${feature.properties.title}
            </div>
          </div>
        `;

          layer.bindTooltip(toolTip, {
            direction: 'top',
            offset: [0, -38] // dependant on the icon
          });
        }

        // Setup out layer events
        layer.on({
          click: (x) => {
            const {
              id,
              metaType
            } = x.target.feature.properties;

            this.props.openModal(id, metaType);
          }
        });
      }
    });
    this.topoLayer.addTo(map);

    // Add search to the map.
    this.map.leafletElement.addControl( new LeafletSearch({ layer: this.topoLayer }) );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.topoLayer.addData(this.props.data);
    }
  }

  polygonLayerStyle = (zLevel: number, layer) => {
    const colours = colourScale(zLevel, [0, 10000])
    layer.setStyle({ fillColor: colours.colour, fillOpacity: 0.5, color: colours.outline, weight: 0, opacity: 0.5 });
    layer.on({
      mouseover: function() {
        this.bringToFront();
        this.setStyle({ weight: 2, opacity: 1 });
      },
      mouseout: function() {
        this.bringToBack();
        this.setStyle({ weight: 1, opacity: .5 });
      }
     });
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  /**
   * Use leaflet's locate method to locate the use and set the view to that location.
   */
  locateUser = () => {
    this.map.leafletElement.locate()
      .on('locationfound', (location: L.LocationEvent) => {
        this.map.leafletElement.flyTo(location.latlng, 10);
      })
      .on('locationerror', () => {
        // Fly to a default location if the user declines our request to get their GPS location or if we had trouble getting said location.
        // Ideally the map would already be in this location anyway.
        this.map.leafletElement.flyTo([this.state.lat, this.state.lng], 10);
      });
  }

  getUserBounds = () => {
    const
      mapBounds = this.map.leafletElement.getBounds(),
      southWest = mapBounds._southWest,
      northEast = mapBounds._northEast;

    return {
      lat_sw: southWest.lat,
      lat_ne: northEast.lat,

      lng_sw: southWest.lng,
      lng_ne: northEast.lng
    };
  }

  /**
   * Checks the zoom level and displays/hides a div
   */
  checkZoom = (callback?: Function): boolean | void => {
    let zoomedOutTooFar = false;
    if (this.map.leafletElement.getZoom() < 1) {
      zoomedOutTooFar = true;
    }

    if (this._isMounted) {
      this.setState({ zoomedOutTooFar });
      return zoomedOutTooFar;
    }
  }

  /**
   *
   * If we've stopped moving wait 1 second then get more markers.
   *
   */
  moveEnd = () => {
    clearTimeout(this.moveEndTimeout);

    const zoomedOutTooFar = this.checkZoom();
    if (zoomedOutTooFar) { return; }

    this.moveEndTimeout = setTimeout( () => this.props.fetchData(this.getUserBounds()), 1000);
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
          <div className="zoomInBuddy">
            <CSSTransition
              in={this.state.zoomedOutTooFar}
              timeout={3000}
              appear={true}
              classNames={
                {
                  enter: 'show animated',
                  enterActive: 'show bounceIn',
                  enterDone: 'show op',
                  exit: 'show animated op',
                  exitActive: 'show bounceOut',
                }
              }
            >
              <div>You need to zoom in a bit further to load more data.</div>
            </CSSTransition>
          </div>
          <TileLayer url={tileLayer} />
        </Map>
      </div>
    );
  }
}

const mapStateToProps = (state: { map: Props }) => ({
  hasError: state.map.hasError,
  data: state.map.data
});

export default connect(mapStateToProps, { fetchData, openModal })(MapView);
