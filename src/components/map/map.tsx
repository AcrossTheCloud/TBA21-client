import * as React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

import { LocationEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { connect } from 'react-redux';

import { getMapIcon } from './icons';
import { OceanObject, renderPeople, Items } from 'components/TableRow';
import { fetchMarkers, putModifiedMarkers } from 'actions/map/map';

import 'styles/components/map/map.scss';

interface Props {
  fetchMarkers: Function;
  putModifiedMarkers: Function;
  modifiedMarkers: MarkerData[];
  markers: MarkerData[];
  hasError: boolean;
}

interface State {
  lat: number;
  lng: number;
  zoom: number;
  sideBarState: string;
  sideBarContent?: JSX.Element;
  markers: MarkerData[];
}
export type MarkerData = {
  key: number,
  type?: string; // popUp or SideBar
  position: any,  // tslint:disable-line: no-any // this is a LatLngExpression ...... [number,number]
  content: string | JSX.Element,
  icon?: any, // tslint:disable-line: no-any // Optional Leaflet icon
  data: OceanObject
};
type MarkerContent = {
  description: string,
  ocean: string
};
const MapStyle = {
  width: '100%',
  height: '100%'
};

/**
 * Default HTML template for popup markers
 * @param item Object
 */
const MapMarkerPopUpContentTemplate = (item: MarkerContent) => {
  return (
    <div>
      <div>{item.description}</div>
      Ocean : {item.ocean};
    </div>
  );
};

class MapView extends React.Component<Props, State> {
  map;

  state = {
    lat: -34.4282514,
    lng: 152, // Default position (Wollongong-ish)
    zoom: 7,
    sideBarState: 'closed',
    sideBarContent: <div/>,
    markers: []
  };

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.openSideBar = this.openSideBar.bind(this);
    this.closeSideBar = this.closeSideBar.bind(this);
    this.handleMarkerSideBarClick = this.handleMarkerSideBarClick.bind(this);
  }

  componentDidMount(): void {

    this.locateUser();

    const hasMarkers = (this.props.markers && this.props.markers.length);
    const hasModifiedMarkers = (this.props.modifiedMarkers && this.props.modifiedMarkers.length);

    if (!hasMarkers) {
      this.props.fetchMarkers();
    } else if (hasModifiedMarkers) {
      this.setState({ markers: this.props.modifiedMarkers });
    }

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    const hasMarkers = (this.props.markers.length && this.props.markers.length);
    const hasModifiedMarkers = (this.props.modifiedMarkers && this.props.modifiedMarkers.length);

    if (hasMarkers && !hasModifiedMarkers) {
      this.modifyMarkers(this.props.markers);
    }
  }

  openSideBar() {
    this.setState({sideBarState: 'open'});
  }

  closeSideBar() {
    this.setState({sideBarState: 'closed'});
  }

  /**
   * Use leaflet's locate method to locate the use and set the view to that location.
   */
  locateUser = () => {
    this.map.leafletElement.locate()
      .on('locationfound', (location: LocationEvent) => {
        this.map.leafletElement.flyTo(location.latlng, 15);
      })
      .on('locationerror', () => {
        // Fly to a default location if the user declines our request to get their GPS location or if we had trouble getting said location.
        // Ideally the map would already be in this location anyway.
        this.map.leafletElement.flyTo([this.state.lat, this.state.lng], 10);
      });
  }

  modifyMarkers = (data: any): void => { // tslint:disable-line: no-any
    let responseMarkers: MarkerData[] = [];

    // TESTING popUp onclick button
    // createMapIcon('iconicon', {
    //   // https://pixabay.com/en/clipart-fish-sign-icon-cartoon-3418130/
    //   iconUrl: './assets/markers/fish.png',
    //   iconSize: [64, 43],
    //   iconAnchor: [32, 43],
    //   popupAnchor: [-3, -38]
    // });
    // data[5].icon = 'iconicon';
    // data[5].type = 'popUp';
    //
    // // TESTING popUp type icon
    // data[6].type = 'popUp';
    // createMapIcon('testing', {
    //   // https://pixabay.com/en/whale-blue-gray-fountain-spray-311849/
    //   iconUrl: './assets/markers/whale.svg',
    //   iconSize: [64, 43],
    //   iconAnchor: [32, 43],
    //   popupAnchor: [-3, -38]
    // });
    // data[6].icon = 'testing';
    // END TESTING

    data.forEach((item, index: number) => {
      const
        lng = item.position[0],
        lat = item.position[1],
        contentTemplate = () => {
          if (item.type === 'popUp') {
            return MapMarkerPopUpContentTemplate(item);
          } else {
            return '';
          }
        };

      let markerData: MarkerData = {
        key: index,
        position: [lat, lng],
        content: contentTemplate(),
        data: item
      };

      if (item.type && item.type.length > 0) {
        markerData.type = item.type;
      } else {
        // Set the default "type" to sidebar, this opens the sidebar with the data when the marker is clicked.
        markerData.type = 'sidebar';
      }

      if (item.icon && item.icon.length > 0) {
        markerData.icon = item.icon;
      }
      responseMarkers.push(markerData);
    });

    this.setState({markers: responseMarkers});

    this.props.putModifiedMarkers(responseMarkers);
  }

  /**
   *
   * Formats an OceanObject into a human readable JSX and presents it nicely to the user.
   *
   * @param oceanObject OceanObject
   */
  handleMarkerSideBarClick(oceanObject: OceanObject) {
    const content = (
      <div className="oceanObject">
        <div className="description text-capitalize">{oceanObject.description}</div>
        <div className="tags small">
          Tags : {oceanObject.tags ? oceanObject.tags.toString() : ''}
        </div>
        <div className="urls"><Items urls={oceanObject.urls} /></div>
        <div className="people">
          {renderPeople(oceanObject.people)}
        </div>
      </div>
    );

    this.setState({sideBarContent: content});

    this.openSideBar();
  }

  /**
   * Looks through our list of Markers and returns them to the Leaflet instance
   * @param props
   * @constructor
   */
  MarkerList = (props: any): JSX.Element => { // tslint:disable-line: no-any
    let items: JSX.Element[] = [];

    const markers = props.markers;

    if (!markers || !Object.keys(markers).length) { return <React.Fragment/>; }

    markers.forEach((marker, key) => {
      const type = marker.type;
      const icon = getMapIcon(marker.icon);

      if (type === 'popUp') {
        items.push(
          <Marker key={key} position={marker.position} icon={icon}>
            <Popup>{marker.content}</Popup>
          </Marker>
        );
      } else if (type === 'sidebar') {
        items.push(<Marker key={key} position={marker.position} icon={icon} onClick={() => { this.handleMarkerSideBarClick(marker.data); }}/>);
      } else {
        items.push(<Marker key={key} position={marker.position} icon={icon} />);
      }

    });

    return <React.Fragment>{items}</React.Fragment>;
  }

  render() {
    const
      position: [number, number] = [this.state.lat, this.state.lng],
      mapID: string = 'mapbox.outdoors',
      accessToken: string = 'pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2ppNnQzNG9nMDRiMDNscDh6Zm1mb3dzNyJ9.nFFwx_YtN04_zs-8uvZKZQ',
      tileLayer: string = 'https://api.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken;

    return (
      <div className={'mapWrapper'}>

        <div id={'sidebar'} className={this.state.sideBarState}>
          <div className="closeButton" onClick={this.closeSideBar}>X</div>
          <div className="content">
            {this.state.sideBarContent}
          </div>
        </div>

        <Map
          center={position}
          zoom={this.state.zoom}
          style={MapStyle}
          ref={map => this.map = map}
        >
          <TileLayer url={tileLayer} />
          <this.MarkerList markers={this.state.markers}/>
        </Map>
      </div>
    );
  }
}

const mapStateToProps = (state: { map: Props }) => ({ // tslint:disable-line: no-any
  markers: state.map.markers,
  modifiedMarkers: state.map.modifiedMarkers,
  hasError: state.map.hasError
});

export default connect(mapStateToProps, { fetchMarkers, putModifiedMarkers })(MapView);
