import * as L from 'leaflet';
import chroma from 'chroma-js';
import { colourScale } from '../utils/colorScale';

/**
 * Adds the legend to the map and set's the colour scale.
 * @param map { L.Map }
 */
export function legend(map: L.Map) {
  const control = new L.Control({ position: 'bottomright' });

  control.onAdd = function () {
    const
      div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 100, 1000, 2000, 3000, 4000, 5000];

    // loop through our density intervals and generate a label with a colored square for each interval
    // first loop for colored legend boxes
    for (let i = 0; i < grades.length; i++) {
      const colours = colourScale(grades[i]);
      div.innerHTML += `<span style="background:${colours.colour}"><label style="color: ${i < 1 ? chroma(colours.colour).darken(2).hex() : chroma(colours.colour).brighten(2).hex()}">${grades[i]}${(grades[i + 1] ? '&ndash;' + grades[i + 1] : '+')}</label></span>`;
    }
    return div;
  };

  control.addTo(map);
}
