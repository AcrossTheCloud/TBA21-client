import * as React from 'react';
import { connect } from 'react-redux';

import { State } from 'reducers/user/viewProfile';

import { RouteComponentProps, withRouter } from 'react-router';

import 'styles/components/pages/viewProfile.scss';
import { Alerts, ErrorMessage } from '../../utils/alerts';
import { Profile } from '../../../types/Profile';
import { fetchProfile, fetchProfileItems } from '../../../actions/user/viewProfile';
import { Col, Row } from 'reactstrap';
import "../../../styles/components/pages/viewProfile.scss"
import { DataLayout } from '../../collection/ViewCollection';
import { Item } from 'types/Item';

interface Props extends RouteComponentProps, Alerts {
  fetchProfile: Function;
  fetchProfileItems: Function;
  profile: Profile;
  items: Item[];
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
      this.props.fetchProfileItems({
        offset: 0,
        limit: 15,
        uuid: '43'
      })
    } else {
      this.setState({ errorMessage: 'No profile with that id.' });
    }
  }

  locationString(): string {
    const { city, country } = this.props.profile;
    if (city && city.length && !country) {
      return city
    } else if (!city && country && country.length) {
      return country
    } else if (city?.length && country?.length) {
      return `${city}, ${country}`
    } else {
      return "—"
    }
  }

  render() {
    if (typeof this.props.profile === 'undefined') {
      return 'Loading...';
    }
    const {
      full_name,
      position,
      affiliation,
      biography,
      website,
      field_expertise,
      profile_type,
      // public_profile
    } = this.props.profile;

    return (
      <div id="viewProfile" >
        <ErrorMessage message={this.props.errorMessage} />
        <Row>
          <Col xs="12" md="6" className="left">
            <Row className="profile-section">
              <Col xs="12" md="auto" style={{ paddingRight: 0 }}>
                {
                  !!this.props.profile.profile_image ?
                    <img className="profile-image" src={this.props.profile.profile_image} alt="" />
                    : <div className="profile-image"></div>
                }
              </Col>
              <Col xs="12" md="auto" className="profile-description">
                <h1>{full_name}</h1>
                <div>
                  <p>{field_expertise}</p>
                  <p className="profile-type">{profile_type}</p>
                </div>
              </Col>
            </Row>

            <Col xs="12" style={{ marginTop: '2rem' }}>
              <h5>
                {biography}
              </h5>
            </Col>
          </Col>

          <Col xs="12" md="6" className="right">
            <div className="detailsRow">
              <div>
                <Col xs="12" className="details">
                  <span className="details-label">Location</span>
                  <span>{this.locationString()}</span>
                </Col>
                <Col xs="12" className="details">

                  <span className="details-label">
                    Website
                </span>
                  {website ? <a href={website}>{website}</a> : '—'}
                </Col>
                <Col xs="12" className="details">
                  <span className="details-label">Position</span>
                  {position && position.length ? position : '—'}
                </Col>
                <Col xs="12" className="details">
                  <span className="details-label">
                    Affiliation
                </span>
                  <span>{affiliation && affiliation.length ? affiliation : "—"}</span>
                </Col>
              </div>
              <div className="gradient-line"></div>
            </div>
          </Col>
        </Row>
        <Row className="author-items">
            {this.props.items.map(item => <DataLayout data={item} key={`item_${item.id}`} />)}
        </Row>
      </div>
    );
  }
}

// const mapDispatchToProps = () => ({
//   fetchProfile: fetchProfile,
//   fetchProfileItems: fetchProfileItems
// })

// State to props
const mapStateToProps = (state: { viewProfile: State }) => { // tslint:disable-line: no-any
  return {
    errorMessage: state.viewProfile.errorMessage,
    profile: state.viewProfile.profile,
    items: state.viewProfile.items,
  };
};

// Connect our redux store State to Props, and pass through the fetchProfile function.
export default withRouter(connect(mapStateToProps,  {
  fetchProfile,
  fetchProfileItems,
})(ViewProfile));
