import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual, flatMap, findIndex } from 'lodash';

import * as topojson from 'topojson-client';

import { Feature, GeoJsonObject, GeometryObject, Point } from 'geojson';
import { OALogo } from './utils/icons';

import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { APITag } from '../metadata/Tags';

import { fetchData, openModal } from 'actions/map/map';
import { legend } from './controls/legend';
import Search from './controls/Search';

import { colourScale } from './utils/colorScale';
import 'styles/components/map/map.scss';

import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import { locateUser } from './utils/locateUser';
import { initialiseMap } from './utils/initialiseMap';
import { initialiseMarkerCluster } from './utils/initialiseMarkerCluster';
import { toggleOverlay } from '../../actions/loadingOverlay';

interface Props {
  toggleOverlay: Function;
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
const mapStyle = {
  width: '100%',
  height: '100%'
};

class MapView extends React.Component<Props, State> {
  map;
  loading: boolean = false;
  markerClusterLayer;
  topoLayer;

  loadedItemIds: number[] = [];
  loadedCollectionIds: number[] = [];

  points: L.Marker[] = [];

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

    this.map = initialiseMap();

    this.markerCluster();

    this.mapMoveEnd();

    const map = this.map;
    const _self = this;

    // Lets attempt to find the user.
    locateUser(map, [this.state.lat, this.state.lng]);
    this.checkZoom();

    // Add the legend to the map
    legend(map);

    // @ts-ignore
    // Leaflet extension for TopoJSON, we ignore this as TS has a spaz
    L.TopoJSON = L.GeoJSON.extend( {
      // Overwrite the addData function.
      addData: function(data: any) {  // tslint:disable-line: no-any
        _self.loadingOverlay(true);

        setTimeout(() => {
          if (data.type === 'Topology') {

            /**
             * Adds the properties to the geo data and either pushes it to Marker Cluster if it's a point or calls L.GeoJSON's add data.
             * @param properties { object }
             * @param featureCollection { FeatureCollection }
             */
            const addData = (properties, featureCollection) => {
              const points: L.Layer[] = [];
              const promises = featureCollection.geometries.map((feature, featureIndex: number) => {
                return new Promise(resolve => {
                  setTimeout(() => {
                    // If we're a point add it to the Marker Cluster Layer array (points)
                    if (feature.type === 'Point') {
                      const latLng = new L.LatLng(feature.coordinates[1], feature.coordinates[0], feature.coordinates[2]);
                      const markerLayer: L.Marker = L.marker(latLng, {icon: OALogo(feature.coordinates[2])});
                      // Add the geometry collection properties to this feature, as sub features don't have the collections properties.
                      markerLayer.feature = {type: 'Feature', properties, geometry: feature.coordinates};
                      _self.layerTooltip(markerLayer.feature, markerLayer);

                      if (Search.hasSearchTerm(markerLayer.feature, _self.searchControl.searchCriteria)) {
                        points.push(markerLayer);
                      }

                      _self.points.push(markerLayer);
                    } else {
                      // Add the geometry collection properties to this feature, as sub features don't have the collections properties.
                      Object.assign(feature, {properties});
                      // Convert the feature to geoJSON for leaflet
                      const geojson = topojson.feature(data, feature);
                      // return the original extension call.
                      L.GeoJSON.prototype.addData.call(this, geojson);
                    }

                    resolve();
                  }, 200 + featureIndex);
                });
              });

              Promise.all(promises).then(() => {
                console.log('All done', points);
                if (points.length) {
                  // Add all points from the array into the map
                  _self.markerClusterLayer.addLayers(points);
                }
              });
            };

            // When any data is added we need to get the geometries from the output
            // We technically un-nest each "feature" (line string etc) out of the collection it comes in.
            data.objects.output.geometries.forEach((geometryCollection, index: number) => {
              if (geometryCollection && geometryCollection.geometries) {

                if (geometryCollection.properties) {
                  _self.addTagsToSearch(geometryCollection.properties.aggregated_concept_tags);
                }

                const featureId = geometryCollection.properties.id;
                const id = typeof featureId === 'string' ? parseInt(featureId, 0) : 0;
                if (geometryCollection.properties.metatype === 'item') {
                  if (findIndex(_self.loadedItemIds, id) === -1) {
                    addData(geometryCollection.properties, geometryCollection);
                    // Push the feature to an array so we can check if we've already loaded it (above)
                    _self.loadedItemIds.push(id);
                  }
                } else if (geometryCollection.properties.metatype === 'collection') {
                  if (findIndex(_self.loadedCollectionIds, id) === -1) {
                    addData(geometryCollection.properties, geometryCollection);
                    // Push the feature to an array so we can check if we've already loaded it (above)
                    _self.loadedCollectionIds.push(id);
                  }
                }
              }
            });
          }
        }, 500);
        _self.loadingOverlay(false);
      }
    });

    // @ts-ignore
    this.topoLayer = new L.TopoJSON(null, {
      // Each feature style it up
      // All markers are handled in AddData L.TopoJSON, this is because we push them off to MarkerCluster
      onEachFeature: (feature: Feature<GeometryObject>, layer: L.Layer) => {
        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
          const latlngs = flatMap(layer.getLatLngs()) as L.LatLng[];
          const altitudes: number[] = [];

          // For each of our lat longs (vertex) add a pin.
          latlngs.forEach( (latLng: L.LatLng) => {
            const altitude = typeof latLng.alt !== 'undefined' ? latLng.alt : 0;

            if (altitude === 0) { return; } // don't create a circle marker for a 0 alt path, you may end up with a bunch of circles..

            // Push the vertex's altitude to the altitudes array for later
            altitudes.push(altitude);

            // Create markers at each vertex and add the title / alt to the tooltip
            const zLevelColour = colourScale(altitude);
            const vertexPin = new L.CircleMarker(new L.LatLng(latLng.lat, latLng.lng, altitude), {
              fillColor: zLevelColour.colour,
              fill: true,
              fillOpacity: 0.8,
              color: zLevelColour.outline,
              stroke: true,
              radius: 5,
              weight: 2
            });

            // Set the vertex's tool tip with it's altitude/depth
            this.layerTooltip(feature, vertexPin, [0, -7]);

            vertexPin.feature = {
              ...feature,
              geometry: feature.geometry as Point,
            };
            // Adds openModal event to the vertex.
            this.onClick(vertexPin);

            vertexPin.addTo(this.topoLayer);
          });

          let highestZLevel = 0;
          if (altitudes.length) {
            // Set the polygons style based on the maximum altitude
            highestZLevel = Math.min(...altitudes);

            // If we have no highestZLevel check for altitude instead
            if (highestZLevel === 0) {
              highestZLevel = Math.max(...altitudes);
            }
          }
          this.polygonLayerStyle(highestZLevel, layer);

          // Set the Lines tooltip, not the vertex
          this.layerTooltip(feature, layer, undefined, highestZLevel);
        }
      }
    });
    this.topoLayer.addTo(map);

    // Setup search controls
    this.searchControl = new Search(map, this.searchOnChange);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.loadingOverlay(true);
      this.topoLayer.addData(this.props.data);
      Search.filterLayer(this.topoLayer, this.searchControl.searchCriteria);
      Search.filterMarkerCluster(this.markerClusterLayer, this.points, this.searchControl.searchCriteria);
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  /**
   * Toggles the loading overlay
   * @param state { boolean }
   */
  loadingOverlay = (state: boolean) => {
    this.loading = state;
    // this.props.toggleOverlay(state);
  }

  /**
   * Enabled mark cluster and adds an on click event to the layers
   */
  markerCluster = () => {
    this.markerClusterLayer = initialiseMarkerCluster(this.map);
    this.markerClusterLayer.on({
    click: (x) => {
     const {
       id,
       metatype
     } = x.layer.feature.properties;

     this.props.openModal(id, metatype);
    }
    });
  }

  /**
   * Binds the tool tip to the layer.
   * @param feature { Feature<GeometryObject> }
   * @param layer { L.Layer }
   * @param offset { [x, y] }
   * @param maxZLevel { number }
   */
  layerTooltip(feature: Feature<GeometryObject>, layer: L.Layer, offset?: [number, number], maxZLevel?: number) {
      // If we have properties (we always should) set our custom tool tip.
      // If the layer is a Marker, add the depth (alt) to the tooltip.
      if (!!feature.properties) {
        let depthDiv = '';
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          const altitude = layer.getLatLng().alt;
          depthDiv = `<div>${Math.sign(altitude ? altitude : 0) <= 0 ? 'Depth' : 'Altitude'}: ${altitude}m</div>`;
        } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
          if (typeof maxZLevel !== 'undefined' || maxZLevel !== 0) {
            depthDiv = `<div>${Math.sign(maxZLevel ? maxZLevel : 0) < 0 ? 'Maximum Depth' : 'Maximum Altitude'}: ${maxZLevel}m</div>`;
          }
        }

        const { title, aggregated_concept_tags} = feature.properties;
        const toolTip = `
          <div>
            <div class="title">
              ${title}
            </div>
            
            ${depthDiv}
            
            ${aggregated_concept_tags.length ? `<small>Concept Tag(s): ${aggregated_concept_tags.map(t => `#${t.tag_name}`).join(', ')}</small>` : ''}
          </div>
        `;
        const options: L.TooltipOptions = {
          direction: 'top'
        };

        if (offset) {
          Object.assign(options,  { offset: offset });
        }

        layer.bindTooltip(toolTip, options);
      }
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
   * When a user selects something in the search control we run these passing in our data and layers
   */
  searchOnChange = () => {
    Search.filterLayer(this.topoLayer, this.searchControl.searchCriteria);
    Search.filterMarkerCluster(this.markerClusterLayer, this.points , this.searchControl.searchCriteria);
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
          metatype
        } = x.target.feature.properties;

        this.props.openModal(id, metatype);
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

  getUserBounds = () => {
    const
      mapBounds = this.map.getBounds(),
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
    if (this.map.getZoom() <= 5) {
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
  mapMoveEnd = () => {
    if (this.map) {
      this.map.on('moveend', () => {
        clearTimeout(this.moveEndTimeout);

        if (this.checkZoom() || this.loading) { return; }

        this.moveEndTimeout = setTimeout( () => this.props.fetchData(this.getUserBounds(), this.loadedItemIds, this.loadedCollectionIds), 1000);
      });
    }
  }

  render() {
    return (
      <div className="mapWrapper mx-0">
        <div
          id="oa_map"
          style={mapStyle}
        />
        <div className="zoomInBuddy">
          <div className={this.state.zoomedOutTooFar ? 'show op' : ''}>
            Data displayed changes on zoom and pan, please be patient.
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: { map: Props }) => ({
  hasError: state.map.hasError,
  data: state.map.data
});

export default connect(mapStateToProps, { fetchData, openModal, toggleOverlay })(MapView);
