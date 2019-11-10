import * as L from 'leaflet';

/**
 *  * Use leaflet's locate method to locate the use and set the view to that location.
 * @param map { L.Map }
 * @param defaultLocation { L.LatLngTuple[Lat, Lng] } Optional
 * @param callback { Function }
 */
export function locateUser(map: L.Map, defaultLocation?: L.LatLngTuple, callback?: Function): void {
  map.locate()
    .on({
      // @ts-ignore
      // Not sure why TS doesn't like this, might be to do with --strictFunctionTypes
      'locationfound': function (location: L.LocationEvent): void {
        if (location && location.latlng) {
          map.flyTo(location.latlng, 8);
          // Set the input fields
          if (typeof callback === 'function') {
            callback({inputLng: location.latlng.lng, inputLat: location.latlng.lat});
          }
        }
      },
      'locationerror': function(): void {
        // Fly to a default location if the user declines our request to get their GPS location or if we had trouble getting said location.
        if (defaultLocation) {
          map.flyTo([defaultLocation[0], defaultLocation[1]], 8);
        }
      }
    }
  );
}
