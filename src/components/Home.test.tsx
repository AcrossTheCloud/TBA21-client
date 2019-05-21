import * as React from 'react';
import { shallow } from 'enzyme';
import { Home } from './Home';

describe('Counter', () => {

  it('Home renders without crashing', () => {
    expect(shallow(<Home />));
  });

});
