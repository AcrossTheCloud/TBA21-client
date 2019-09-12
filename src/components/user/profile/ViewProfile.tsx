import * as React from 'react';
import { connect } from 'react-redux';

import { State } from 'reducers/user/viewProfile';

import { RouteComponentProps, withRouter } from 'react-router';

import 'styles/components/pages/viewItem.scss';
import { Alerts, ErrorMessage } from '../../utils/alerts';
import { Profile } from '../../../types/Profile';
import { fetchProfile } from '../../../actions/user/viewProfile';

interface Props extends RouteComponentProps, Alerts {
  fetchProfile: Function;
  profile: Profile;
}

class ViewProfile extends React.Component<Props, State> {
  matchedId: string = '';

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    // Get our profileId passed through from URL props
    if (props.location && props.location.pathname) {
      this.matchedId = props.location.pathname.replace('/profiles/', '');
    }
  }

  componentDidMount() {
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (this.matchedId) {
      this.props.fetchProfile(this.matchedId);
    } else {
      this.setState({ errorMessage: 'No profile with that id.' });
    }
  }

  render() {
    if (typeof this.props.profile === 'undefined') {
      return 'Loading...';
    }

    return (
      <div id="profile">
        <ErrorMessage message={this.props.errorMessage} />

      </div>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewProfile: State }) => { // tslint:disable-line: no-any
  return {
    errorMessage: state.viewProfile.errorMessage,
    profile: state.viewProfile.profile
  };
};

// Connect our redux store State to Props, and pass through the fetchProfile function.
export default withRouter(connect(mapStateToProps, { fetchProfile })(ViewProfile));
