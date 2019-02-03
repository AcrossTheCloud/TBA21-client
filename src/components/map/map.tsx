import * as React from 'react';
import { Container } from 'reactstrap';

import 'leaflet/dist/leaflet.css';

import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

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
};

const PopupMarker = ({ content, position }: MarkerData) => (
    <Marker position={position}>
        <Popup>{content}</Popup>
    </Marker>
);

const MarkerList = ({ markers }: { markers: Array<MarkerData> }) => {
    const items = markers.map(({ key, ...props }) => (
        <PopupMarker key={key} {...props} />
    ));
    return <React.Fragment>{items}</React.Fragment>;
};

const MapStyle = {
    width: '100%',
    height: '80vh'
};

export class MapView extends React.Component<{}, State> {

    state = {
        lat: -34.4282514,
        lng: 150.8755489, // Default position (Wollongong)
        zoom: 13,
        markers: [
            { key: 'marker1', position: [-34.4282514, 150.8755489], content: 'My first popup' },
            { key: 'marker2', position: [-34.4282514, 150.8755485], content: 'My second popup' },
            { key: 'marker3', position: [-34.4282514, 150.8755482], content: 'My third popup' },
        ],
    };

    constructor(props: any) { // tslint:disable-line: no-any
        super(props);
    }

    render() {
        const position: [number, number] = [this.state.lat, this.state.lng];

        return (
            <Container>
                <Map center={position} zoom={this.state.zoom} style={MapStyle}>
                    <TileLayer
                        attribution={'&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MarkerList markers={this.state.markers} />
                </Map>
            </Container>
        );
    }
}
