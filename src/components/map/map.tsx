import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual, findIndex, flatMap } from 'lodash';

import * as topojson from 'topojson-client';

import { CSSTransition } from 'react-transition-group';

import { Feature, GeoJsonObject, GeometryObject, Point } from 'geojson';
import { jellyFish, pin } from './icons';
import { Map, TileLayer } from 'react-leaflet';

import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchData, openModal } from 'actions/map/map';

import { legend } from './controls/legend';
import Search from './controls/Search';
import { colourScale } from './colorScale';

import 'animate.css/animate.min.css';
import 'styles/components/map/map.scss';
import { APITag } from '../metadata/Tags';

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
  existingConceptTags: number[] = [];
  searchControl;

  state = {
    lat: -34.4282514,
    lng: 152, // Default position (Wollongong-ish)
    zoom: 7,
    zoomedOutTooFar: false
  };

  componentDidMount(): void {
    this._isMounted = true;
    const map = this.map.leafletElement;
    const _self = this;

    // Lets attempt to find the user.
    this.locateUser();

    // Add the legend to the map
    legend(map);

    // @ts-ignore
    // Leaflet extension for TopoJSON, we ignore this as TS has a spaz
    L.TopoJSON = L.GeoJSON.extend( {
      // Overwrite the addData function.
      addData: function(data: any) {  // tslint:disable-line: no-any
        if (data.type === 'Topology') {
          // When any data is added we need to get the geometries from the output
          // We technically un-nest each "feature" (line string) out of the collection it comes in, this makes styling it a hell of a lot easier.
          data.objects.output.geometries.forEach((geometryCollection, index: number) => {

            if (geometryCollection && geometryCollection.geometries) {

              if (geometryCollection.properties) {
                _self.addTagsToSearch(geometryCollection.properties.aggregated_concept_tags);
              }

              geometryCollection.geometries.forEach((feature, featureIndex: number) => {
                // Add the properties to the feature, these are in the top level collection.
                Object.assign(feature, {properties: geometryCollection.properties});

                // Convert the feature to geoJSON for leaflet
                const geojson = topojson.feature(data, feature);

                // If our loaded data array doesn't contain the feature, push it in
                if (findIndex(_self.loadedData, geojson) === -1) {
                  // Push out feature to an array so we can check if we've already loaded it (above)
                  _self.loadedData.push(geojson);

                  // return the original extension call.
                  L.GeoJSON.prototype.addData.call(this, geojson);
                }
              });
            }
          });
        }
      }
    });

    // @ts-ignore
    this.topoLayer = new L.TopoJSON(null, {
      // Add our custom marker to points.
      pointToLayer: (feature: Feature<GeometryObject>, latlng: L.LatLng) => {
        return new L.Marker(latlng, {icon: jellyFish(latlng.alt)});
      },
      // Each feature style it up
      onEachFeature: (feature: Feature<GeometryObject>, layer: L.Layer) => {
        // If we have properties (we always should) set our custom tool tip.
        // If the layer is a Marker, add the depth (alt) to the tooltip.
        if (!!feature.properties) {
          const toolTip = `
            <div>
              <div class="title">
                ${feature.properties.title}
              </div>
              
              ${layer instanceof L.Marker ? `<div>Depth: ${layer.getLatLng().alt}</div>` : ''}
            </div>
          `;

          layer.bindTooltip(toolTip, {
            direction: 'top',
            offset: [0, -38] // dependant on the icon
          });
        }

        this.onClick(layer);

        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
          const latlngs = flatMap(layer.getLatLngs()) as L.LatLng[];
          const altitudes: number[] = [];

          // For each of our lat longs (vertex) add a pin.
          latlngs.forEach( (latLng: L.LatLng) => {
            const altitude = latLng.alt ? latLng.alt : 0;
            // Push the vertex's altitude to the altitudes array for later
            altitudes.push(altitude);

            // Create markers at each vertex and add the title / alt to the tooltip
            const vertexPin = new L.Marker(new L.LatLng(latLng.lat, latLng.lng, altitude), { icon: pin(altitude) });
            const toolTip = `<div>Depth: ${altitude}</div>`;

            vertexPin.feature = {
              type: 'Feature',
              geometry: feature.geometry as Point,
              properties: feature.properties
            };

            vertexPin.bindTooltip(toolTip, {
              direction: 'top',
              offset: [0, -20] // dependant on the icon
            });

            // Adds openModal event to the vertex.
            this.onClick(vertexPin);

            vertexPin.addTo(this.topoLayer);
          });

          // Set the polygons style based on the maximum altitude
          const maxZLevel = Math.max(...altitudes);
          this.polygonLayerStyle(maxZLevel, layer);
        }
      }
    });
    this.topoLayer.addTo(map);

    // Setup search controls
    this.searchControl = new Search(map, this.topoLayer);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.topoLayer.addData(this.props.data);
      Search.filterLayers(this.topoLayer, this.searchControl.searchCriteria);
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  /**
   * Adds loaded concept tags from the topoJSON into the search component
   * @param tags { APITag[] }
   */
  addTagsToSearch = (tags: APITag[]) => {
    // Check that we don't have already existing tags by this name.
    const conceptTags: APITag[] = [];
    tags.forEach(tag => {
      if (this.existingConceptTags.indexOf(tag.id) === -1) {
        conceptTags.push(tag);
        // Push the ids to an array so we can compare later.
        this.existingConceptTags.push(tag.id);
      }
    });
    this.searchControl.appendConceptTags(conceptTags);
  }

  /**
   * Sets the onClick open Collection/Item event on the layer.
   * @param layer { L.Layer }
   */
  onClick = (layer: L.Layer) => {
    // On click open the item or collection.
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

  /**
   * Sets the style of the layer sent to it, this layer should be a polygon.
   * Set's up mouse over/out styles
   * @param zLevel { number }
   * @param layer { L.Layer }
   */
  polygonLayerStyle = (zLevel: number, layer) => {
    const colours = colourScale(zLevel);
    layer.setStyle({
       fillColor: colours.colour,
       fillOpacity: 0.8,
       color: colours.outline,
       weight: 2,
       opacity: 0.8,
       fillRule: 'evenodd'
     });
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
    if (this.map.leafletElement.getZoom() < 5) {
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
          boxZoom={false}
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
