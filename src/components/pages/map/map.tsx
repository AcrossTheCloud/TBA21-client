import '../../../styles/pages/map/map.scss';

import * as React from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapIcon } from './icons';

interface State {
    lat: number;
    lng: number;
    zoom: number;
    markers: Array<Object>;
}

type MarkerData = {
    key: string,
    position: any,  // tslint:disable-line: no-any // this is a LatLngExpression ...... [number,number]
    content: string,
    icon?: any, // tslint:disable-line: no-any // Optional Leaflet icon
};

const PopupMarker = ({ content, position, icon }: MarkerData) => {
    icon = getMapIcon(icon);

    return (
        <Marker position={position} icon={icon}>
            <Popup>{content}</Popup>
        </Marker>
    );
};

const MarkerList = ({ markers }: { markers: Array<MarkerData> }) => {
    const items = markers.map(({ key, ...props }) => (
        <PopupMarker key={key} {...props} />
    ));
    return <React.Fragment>{items}</React.Fragment>;
};

export class MapView extends React.Component<{}, State> {

    state = {
        lat: -34.4282514,
        lng: 150.8755489, // Default position (Wollongong)
        zoom: 13,
        markers: [
            { key: 'woolies', position: [-34.4270106, 150.896254], content: 'Woolworths Wollongong!' },
            { key: 'apopup', position: [-34.4282514, 150.8755485], content: 'Another popup' },
            { key: 'uni', position: [-34.3959849, 150.8707482], content: 'Uni' },
        ],
    };

    constructor(props: any) { // tslint:disable-line: no-any
        super(props);
    }

    render() {
        const position: [number, number] = [this.state.lat, this.state.lng];

        return (
            <div className={'mapWrapper'}>
                <Map center={position} zoom={this.state.zoom}>
                    <TileLayer
                        attribution={'&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MarkerList markers={this.state.markers} />
                </Map>
            </div>
        );
    }
}
