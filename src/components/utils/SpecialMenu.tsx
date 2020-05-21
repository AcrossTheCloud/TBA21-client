import React, { Component } from 'react';
import 'styles/components/specialMenu.scss';

import {ReactComponent as CollectionIcon} from '../../images/svgs/collection.svg';

interface Props {
  id?: string;
}

export default class SpecialMenu extends Component<Props,{}> {

  mappings = {
    '893': {title: 'Multiple Oceans'},
    '894': {title: 'Sea Level Rise'},
    '898': {title: 'Coastal Urbanization'},
    '897': {title: 'Coastal Transformation'},
    '902': {title: 'Sensible Zone'},
    '904': {title: 'Chlorophyll and Algae Bloom / Dead Zones'},
    '931': {title: 'Bathymetry'},
    '900': {title: 'Continental Shelves'},
    '899': {title: 'Overfishing'},
    '901': {title: 'Transport / Shipment'},
    '895': {title: 'Atmosphere'},
    '896': {title: 'Climate Justice'}
  }

  mappings_ids_inOrder = [
    '893',
    '894',
    '898',
    '897',
    '902',
    '904',
    '931',
    '900',
    '899',
    '901',
    '895',
    '896'
  ]

  collections_to_display_in = ['51','49','67','68', '69', '53'];

  toDisplay = (): boolean => {
    if (window.location.pathname.match(/collection/) && this.collections_to_display_in.includes(this.props.id as string)) {
      return true;
    } else if (this.props.id==='963') {
      return true
    } else {
      return (this.props.id ? (this.props.id in this.mappings) : false);
    }
  }

  render() {
    if (this.toDisplay()) {
    return (
      <div className="col-12 list" id="specialMenu">
        {window.location.pathname.match(/collection\/51/) ? 
          (<div className="current" id="51">
             <CollectionIcon /> Sensing the Oceans: Anthropogenic Drivers</div>)
          :

          (
            <div className="related">
            <a className="collection_link" href={`/collection/51`} target="_self" rel="51" id="51">
            <CollectionIcon /> Sensing the Oceans: Anthropogenic Drivers</a>
          </div> 
          )
        }
        <hr />
        {this.mappings_ids_inOrder.map((id)=> 
          id === window.location.pathname.split('/')[-1] ? <div className="current" id={id}>{this.mappings[id].title}</div> : 
          <div className="related">
            <a className="collection_link" href={`/view/${id}`} target="_self" rel={id} id={id}>
            {this.mappings[id].title}</a>
          </div> 
      )}
      </div>)
    } else {
      return (<></>)
    }
  }   
}
