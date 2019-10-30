import * as L from 'leaflet';
import { APITag } from '../../metadata/Tags';

interface SearchCriteria {
  concept_tag_ids: number[];
}

/**
 *
 * @param map { L.Map }
 */
export default class Search {
  map;
  geoJSONLayer;
  selectInput;
  searchCriteria: SearchCriteria = {
    concept_tag_ids: []
  };

  static filterLayers = (geoJSONLayer: L.FeatureGroup, searchCriteria: SearchCriteria) => {
    if (geoJSONLayer) {
      geoJSONLayer.eachLayer(layer => {
        // @ts-ignore feature does exist, jerk.
        const feature = layer.feature;
        // @ts-ignore it does..
        const element = layer.getElement();

        if (feature.properties && searchCriteria.concept_tag_ids && searchCriteria.concept_tag_ids.length) {
          if (feature.properties.aggregated_concept_tags.filter(a => searchCriteria.concept_tag_ids.indexOf(a.id) !== -1).length) {
            console.log('Block');
            element.style.display = 'block';
          } else {
            console.log('None');
            element.style.display = 'none';
          }
        }
      });
    }
  }

  constructor(map: L.Map, geoJSONLayer: L.LayerGroup) {
    this.map = map;
    this.geoJSONLayer = geoJSONLayer;
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

    this.selectInput = select;

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

          Search.filterLayers(this.geoJSONLayer, this.searchCriteria);
        }
      });

    return select;
  }
}
