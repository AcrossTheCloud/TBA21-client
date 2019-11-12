/**
 * Initialises the markerCluster layer and the events
 */
import * as L from 'leaflet';

export const initialiseMarkerCluster = map => {
  // initialise marker cluster
  const cluster = L.markerClusterGroup({
     showCoverageOnHover: false,
     zoomToBoundsOnClick: true
   });

  map.addLayer(cluster, {
    chunkedLoading: true
  });

  return cluster;
}
