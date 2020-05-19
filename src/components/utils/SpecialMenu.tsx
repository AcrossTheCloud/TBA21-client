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
    '902': {title: 'Sensible Zone'},
    '895': {title: 'Atmosphere'},
    '904': {title: 'Eutrophication, Algae, Dead Zones'},
    '899': {title: 'Overfishing'},
    '901': {title: 'Transport / Shipment'},
    '931': {title: 'Bathymetry / Extractivism'},
    '900': {title: 'Continental Shelves'},
    '898': {title: 'Coastal Urbanization'},
    '897': {title: 'Coastal Transformation'},
    '896': {title: 'The Knowledge of Land and Water: Indigenous Climate Justice'}
  }

  mappings_ids_inOrder = [
    '893',
    '894',
    '902',
    '895',
    '904',
    '899',
    '901',
    '931',
    '900',
    '898',
    '897',
    '896'
  ]

  toDisplay = (): boolean => {
    if (window.location.pathname.match(/collection/) && this.props.id==='51') {
      return true;
    } else {
      return (this.props.id ? (this.props.id in this.mappings) : false);
    }
  }

  render() {
    if (this.toDisplay()) {
    return (
      <div className="col-12 list" id="specialMenu">
        {window.location.pathname.match(/collection/) ? 
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
