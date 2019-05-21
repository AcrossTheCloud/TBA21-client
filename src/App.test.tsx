import * as React from 'react';
import { shallow } from 'enzyme';
import { App } from './App';

describe('Counter', () => {
  test('App has a navigation bar', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find('navigation'));
  });

  it('App renders without crashing', () => {
    expect(shallow(<App />));
  });

});
