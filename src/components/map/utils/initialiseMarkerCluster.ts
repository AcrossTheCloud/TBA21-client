/**
 * Initialises the markerCluster layer and the events
 */
import * as L from 'leaflet';

export const initialiseMarkerCluster = map => {
  // initialise marker cluster

  const options = {
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    chunkedLoading: true
  };
  const cluster = L.markerClusterGroup(options);

  map.addLayer(cluster);

  return cluster;
}
