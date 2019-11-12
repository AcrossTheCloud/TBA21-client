/**
 * Initialises the markerCluster layer and the events
 */
import * as L from 'leaflet';
import { progressBar } from './progressBar';

export const initialiseMarkerCluster = map => {
  // initialise marker cluster

  const options = {
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    chunkedLoading: true,
    chunkProgress: progressBar
  };
  const cluster = L.markerClusterGroup(options);

  map.addLayer(cluster);

  return cluster;
}
