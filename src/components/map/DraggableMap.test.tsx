import * as React from 'react';
import { shallow } from 'enzyme';
import DraggableMap from './DraggableMap';

describe('Draggable map', () => {
  let wrapper;
  const
    props = {
      geojson: '{"type":"Point","coordinates":[-12, 120]}'
    },
    geoJSON = JSON.parse(props.geojson);

  beforeAll( () => {
    wrapper = shallow(<DraggableMap {...props} />);
  });

  afterAll( () => {
    wrapper.unmount();
  });

  it('It should mount', () => {
    const instance = wrapper.instance();

    jest.spyOn(instance, 'componentDidMount');
    instance.componentDidMount();

    expect(instance.componentDidMount).toHaveBeenCalledTimes(1);
  });

  it('State should have LAT LNG from props after mount', () => {
    expect(wrapper.state('marker')).toMatchObject({ lat: geoJSON.coordinates[0], lng: geoJSON.coordinates[1] });
  });

  it(`Lat input field should equal our props lat ${geoJSON.coordinates[0]}`, () => {
    expect(wrapper.find('#draggableMap Input.lat').props().value).toEqual(geoJSON.coordinates[0]);
  });

  it(`Lng input field should equal our props lng ${geoJSON.coordinates[1]}`, () => {
    expect(wrapper.find('#draggableMap Input.lng').props().value).toEqual(geoJSON.coordinates[1]);
  });

});
