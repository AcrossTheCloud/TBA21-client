import * as L from 'leaflet';

/**
 * Sets up the leaflet map and tile layer and returns the map
 * @param element
 * @param viewPosition { L.LatLngTuple[Lat, Lng] }
 * @returns { L.Map }
 */
export function initialiseMap(element: string = 'oa_map', viewPosition?: L.LatLngTuple): Promise<L.Map> {
  return new Promise( resolve => {
    const
      mapID: string = 'ck2v1bjni03r81cpan7p75w4v',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayerURL: string = 'https://api.mapbox.com/styles/v1/acrossthecloud/' + mapID + '/tiles/256/{z}/{x}/{y}@2x?access_token=' + accessToken;

    const map = L.map(element, {
      minZoom: 3,
      maxZoom: 18,
      maxBounds: L.latLngBounds([-90, -180], [90, 180]),
      zoom: 5,
      center: [0, 0],
      preferCanvas: true
    });

    L.tileLayer(tileLayerURL, {
      attribution: '',
      maxZoom: 18,
      id: mapID,
      accessToken: accessToken
    }).addTo(map);

    if (viewPosition) {
      map.setView([viewPosition[0], viewPosition[1]], 5);
    }

    map.whenReady( () => resolve(map));

  });
}
