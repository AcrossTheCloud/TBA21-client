import * as React from 'react';
import { mount } from 'enzyme';
import DraggableMap from './DraggableMap';

describe('Draggable map', () => {
  let wrapper;
  const props = {
    markerPosition: { lat: -12, lng: 120}
  };

  // Mount the component before each test
  beforeEach(() => {
    wrapper = mount(<DraggableMap {...props} />);
  });

  // Unmount after each test
  afterEach( () => {
    wrapper.unmount();
  });

  it('It should mount', () => {
    const instance = wrapper.instance();

    jest.spyOn(instance, 'componentDidMount');
    instance.componentDidMount();

    expect(instance.componentDidMount).toHaveBeenCalledTimes(1);
  });

  it('Props should have pre-defined Lat and Lng maker positions', () => {
    expect(wrapper.props('markerPosition')).toMatchObject(props);
  });

  it('State should have LAT LNG from props after mount', () => {
    const instance = wrapper.instance();
    instance.componentDidMount();

    expect(wrapper.state('marker')).toMatchObject(props.markerPosition);
  });

  it(`Lat input field should equal our props lat ${props.markerPosition.lat}`, () => {
    const instance = wrapper.instance();
    instance.componentDidMount();

    expect(wrapper.find('#draggableMap input.lat').props().value).toEqual(props.markerPosition.lat);
  });

  it(`Lng input field should equal our props lng ${props.markerPosition.lng}`, () => {
    const instance = wrapper.instance();
    instance.componentDidMount();

    expect(wrapper.find('#draggableMap input.lng').props().value).toEqual(props.markerPosition.lng);

  });

});
