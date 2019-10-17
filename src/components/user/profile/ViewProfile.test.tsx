import * as React from 'react';
import { shallow } from 'enzyme';

import { ViewProfile } from './ViewProfile';
import * as fixtures from '../../../__fixtures__';

const defaultProfile = fixtures.Profiles[0];

describe('ViewProfile', () => {
  function subject(overrideProps) {
    const defaultProps = {
      fetchProfile: jest.fn(),
      profile: defaultProfile
    };
    const props = { ...defaultProps, ...overrideProps };
    return shallow(<ViewProfile {...props} />);
  }

  it('renders a profile', () => {
    const wrapper = subject({});

    expect(wrapper.find('div').find({ id: 'Profile' })).toEqual({});
  });

  it('calls fetchProfile on mount with profile id', () => {
    const fetchProfile = jest.fn();
    const location = { pathname: '/profiles/1' };
    subject({ fetchProfile, location });
    expect(fetchProfile).toHaveBeenCalledWith('1');
  });
});
