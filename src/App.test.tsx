import * as React from 'react';
import { shallow } from 'enzyme';
import { App } from './App';

describe('App', () => {
  test('Has a navigation bar', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find('navigation'));
  });

  it('Renders without crashing', () => {
    expect(shallow(<App />));
  });

});
