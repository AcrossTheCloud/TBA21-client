import React, { Component } from 'react';
import 'styles/components/specialMenu.scss';

interface Props {
  id: number;
}

export default class SpecialMenu extends Component<Props,{}> {
  constructor(props){
    super(props);
  }

  mappings = {
    '893': {title: 'Multiple Oceans'},
    '894': {title: 'Sea Level Rise'},
    '902': {title: 'Sensible Zone'},
    '895': {title: 'Atmosphere'},
    '904': {title: 'Eutrophication, Algae, Dead Zones'},
    '899': {title: 'Overfishing'},
    '901': {title: 'Transport / Shipment'},
    '931': {title: 'Bathymetry / Extractivism'},
    '900': {title: 'Continental Shelf'},
    '898': {title: 'Coastal Urbanization'},
    '897': {title: 'Coastal Transformation'},
    '896': {title: 'The Knowledge of Land and Water: Indigenous Climate Justice'}
  }

  toDisplay = (): boolean => {
    const id = window.location.pathname.split('/')[-1];
    if (window.location.pathname.match(/collection/) && id==='51') {
      return true;
    } else {
      return id in this.mappings;
    }
  }

  render() {
    if (this.toDisplay()) {
    return (
      <div className="col-12 list" id="specialMenu">
        {window.location.pathname.match(/collection/) ? 
          (<div className="current" id="51">Sensing the Oceans: Anthropogenic Drivers</div>)
          :

          (
            <div className="related">
            <a className="collection_link" href={`/collection/51`} target="_self" rel="51" id="51">
            Sensing the Oceans: Anthropogenic Drivers</a>
          </div> 
          )
        }
        <hr />
        {Object.keys(this.mappings).map((id)=> 
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
