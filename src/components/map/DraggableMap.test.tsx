import * as React from 'react';
import { shallow } from 'enzyme';
import DraggableMap from './DraggableMap';

describe('Draggable map', () => {

  it('Renders without crashing', () => {
    expect(shallow(<DraggableMap />));
  });

});
