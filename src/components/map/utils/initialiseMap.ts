import * as L from 'leaflet';

/**
 * Sets up the leaflet map and tile layer and returns the map
 * @param element
 * @param viewPosition { L.LatLngTuple[Lat, Lng] }
 * @returns { L.Map }
 */
export function initialiseMap(element: string = 'oa_map', viewPosition?: L.LatLngTuple): L.Map {
  const
    mapID: string = 'mapbox.outdoors',
    accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
    tileLayerURL: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken;

  const map = L.map(element, {
    maxZoom: 18,
    zoom: 5,
    center: [0, 0],
    preferCanvas: true
  });

  if (viewPosition) {
   map.setView([viewPosition[0], viewPosition[1]], 5);
  }

  L.tileLayer(tileLayerURL, {
    attribution: '',
    maxZoom: 18,
    id: mapID,
    accessToken: accessToken
  }).addTo(map);

  return map;
}
