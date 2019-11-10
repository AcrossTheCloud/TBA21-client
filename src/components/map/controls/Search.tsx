import * as L from 'leaflet';
import { APITag } from '../../metadata/Tags';
import { Feature } from 'geojson';
import searchIcon from '../icons/search-solid.svg';

interface SearchCriteria {
  concept_tag_ids: number[];
}

/**
 *
 * @param map { L.Map }
 */
export default class Search {
  map;
  onChange;
  selectInput;
  searchCriteria: SearchCriteria = {
    concept_tag_ids: [-1] // -1 is "All"
  };

  // Filter polylines / polygons
  static filterLayer = (layerGroup: L.FeatureGroup, searchCriteria: SearchCriteria) => {
    if (layerGroup) {
      layerGroup.eachLayer(layer => {
        // @ts-ignore feature does exist, jerk.
        const feature = layer.feature;

        if (layer instanceof L.Polygon || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
          if (feature.properties && feature.properties.aggregated_concept_tags && feature.properties.aggregated_concept_tags.length && searchCriteria.concept_tag_ids && searchCriteria.concept_tag_ids.length) {
            if (searchCriteria.concept_tag_ids.includes(-1)) {
              layer.setStyle({opacity: 0.8, fillOpacity: 0.8});
            } else {
              if (feature.properties.aggregated_concept_tags.filter(a => searchCriteria.concept_tag_ids.indexOf(a.id) !== -1).length) {
                layer.setStyle({opacity: 0, fillOpacity: 0});
              } else {
                layer.setStyle({opacity: 0, fillOpacity: 0});
              }
            }
          }
        }
      });
    }
  }

  static filterMarkerCluster = (layerGroup: L.MarkerClusterGroup, points: L.Marker[], searchCriteria: SearchCriteria) => {
    if (layerGroup) {
      // layerGroup.clearLayers();

      points.forEach(layer => {
        // @ts-ignore feature does exist, jerk.
        const feature = layer.feature;

        if (feature) {
          if (Search.hasSearchTerm(feature, searchCriteria)) {
            // If the layer doesn't already exist add it
            if (!layerGroup.hasLayer(layer)) {
              layerGroup.addLayer(layer);
            }
          } else {
            layerGroup.removeLayer(layer);
          }
        }
      });

      layerGroup.refreshClusters(layerGroup);
    }
  }

  static hasSearchTerm = (feature: Feature, searchCriteria: SearchCriteria): boolean => {
    let result: boolean = false;
    if (feature && feature.properties ) {

      // If we have any concept tags in our search criteria
      const conceptTagIds = searchCriteria.concept_tag_ids;
      if (conceptTagIds && conceptTagIds.length) {
        // If we have -1 this means all, we should show everything.
        if (conceptTagIds.includes(-1)) {
          result = true;
        } else {
          const aggregatedConceptTags: APITag[] | undefined = feature.properties.aggregated_concept_tags;
          // If we have aggregated tags and tags in our search criteria
          if (aggregatedConceptTags && aggregatedConceptTags.length) {
            // Check if the concept tag id is in the properties for this feature.
            if (aggregatedConceptTags.filter(a => conceptTagIds.indexOf(a.id) !== -1).length) {
              result = true;
            }
          }
        }
      }
    }

    return result;
  }

  constructor(map: L.Map, onChange: Function) {
    this.map = map;
    this.onChange = onChange;
    this.init();
  }

  /**
   * A custom control for searching inside the GeoJSON loaded on the map.
   */
  init() {
    const _self = this;
    const searchControl = new L.Control({ position: 'topleft' });

    /**
     * Toggle the display of the contents
     */
    function toggle() {
      const div = document.getElementById('searchControl');
      if (div) {
        const display: boolean = div.getAttribute('data-display') === 'true';
        div.setAttribute('data-display', `${!display}`);
        const contentsDiv = document.getElementById('searchControlContent');
        if (contentsDiv) {
          contentsDiv.style.cssText = `${display ? 'height: 0; width: 0; border-width: 0;' : ''}`;
        }
      }
    }

    searchControl.onAdd = function () {
      const controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      controlDiv.id = 'searchControl';
      controlDiv.setAttribute('data-display', 'false');

      const controlUI = L.DomUtil.create('a', 'icon', controlDiv);
      controlUI.title = 'Search';
      controlUI.innerHTML = `<img alt="Search" src="${searchIcon}" width="17" height="15" />`;
      L.DomEvent.on(controlUI, 'click', event => {
        L.DomEvent.stopPropagation(event);
        L.DomEvent.preventDefault(event);
        toggle();
      });

      const contents = L.DomUtil.create('div', 'leaflet-bar leaflet-control', controlDiv);
      contents.id = 'searchControlContent';
      contents.innerHTML = `<h3>Search</h3>`;
      contents.style.cssText = 'height: 0; width: 0; border-width: 0;';
      contents.appendChild(_self.conceptTagsInput());

      return controlDiv;
    };

    searchControl.addTo(this.map);
  }

  /**
   * Appends tags to the ConceptTagInput select element
   * @param tags
   */
  appendConceptTags (tags: APITag[]): void {
    let select: HTMLSelectElement | null = document.getElementById('conceptTags') as HTMLSelectElement;

    /**
     * Creates options for the select input and appends them
     * @param value { string }
     * @param innerHTML { string }
     * @param selected { boolean }
     */
    const createOption = (value: string, innerHTML: string, selected: boolean = false): void => {
      if (select) {
        const option = document.createElement('option');
        option.value = value;
        option.innerHTML = innerHTML;
        option.selected = selected;
        select.appendChild(option);
      }
    };

    // If it already exists create new options
    if (select && tags && tags.length) {
      tags.forEach( tag => createOption(tag.id.toString(), tag.tag_name) );
    }
  }

  /**
   * Creates a multi select element
   */
  conceptTagsInput = (): HTMLElement => {
    const select = document.createElement('select');
    select.multiple = true;
    select.id = 'conceptTags';
    select.className = 'custom-select';
    this.selectInput = select;
    L.DomEvent.on(select, 'mousewheel', L.DomEvent.stopPropagation);

    // A All option
    const allOption = document.createElement('option');
    allOption.value = '-1';
    allOption.innerHTML = 'All';
    allOption.selected = true;
    select.appendChild(allOption);

    L.DomEvent
      .on(select, 'change', event => {
        if (select && select.children) {
          const ids: number[] = [];

          // Make an array of the children from the select and push the value (id) to an array
          Array.from(select.children).filter((z: Element) => {
            const option = z as HTMLOptionElement;
            return option.selected;
          }).forEach((o: Element) => {
            const option = o as HTMLOptionElement;
            const id: number = parseInt(option.value, 0);
            if (id) {
              ids.push(id);
            }
          });

          this.searchCriteria.concept_tag_ids = ids;

          if (typeof this.onChange === 'function') {
            this.onChange();
          }

        }
      });

    return select;
  }
}
