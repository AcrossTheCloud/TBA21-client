import * as L from 'leaflet';

interface Icons {
  [name: string]: any; // tslint:disable-line: no-any
}

// All of our markers live here.
export let MapIcons: Icons = {};

// A list of our default icons
const defaultIcons: Icons = {
  'jellyFish': {
    iconUrl: '/assets/markers/jelly.svg',
    iconSize:     [30, 38], // size of the icon
    iconAnchor:   [15, 38], // point of the icon which will correspond to marker's location [iconWidth/2, iconHeight]
    popupAnchor:  [-3, -38] // point from which the popup should open relative to the iconAnchor
  }
};

/**
 * Loop through our DefaultIcons and create a new Leaflet icon for each of them.
 */
Object.keys(defaultIcons).forEach( (key) => {
  createMapIcon(key, defaultIcons[key]);
});

/**
 * Checks the MapIcons Object for a icon with the same name, if it doesn't exist you're getting a jellyFish
 *
 * @param iconName String, name of the icon
 * @return a Leaflet Icon Object to be assigned to a Marker.
 */
export function getMapIcon(iconName?: string) {// tslint:disable-line: no-any
  if (!iconName) {
    return MapIcons.jellyFish;
  } else {
    const iconExists = iconName in MapIcons;
    if (!iconExists) {
      return MapIcons.jellyFish;
    }
    return MapIcons[iconName];
  }
}

/**
 * Creates a new icon and puts in into the MapIcons Object
 *
 * @param iconName
 * @param iconOptions
 * @return a Leaflet Icon Object to be assigned to a Marker.
 */
export function createMapIcon(iconName: string, iconOptions: L.IconOptions) {
  const iconExists = iconName in MapIcons;
  if (!iconExists) {
    MapIcons[iconName] = new L.Icon(iconOptions);
  }

  return MapIcons[iconName];
}
