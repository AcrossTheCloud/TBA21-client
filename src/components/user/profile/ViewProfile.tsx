import * as React from 'react';
import { connect } from 'react-redux';

import { State } from 'reducers/user/viewProfile';

import { RouteComponentProps, withRouter } from 'react-router';

import ViewCollection from '../../collection/ViewCollection';

import 'styles/components/pages/viewProfile.scss';
import { Alerts, ErrorMessage } from '../../utils/alerts';
import { Profile, groupProfileTypes } from '../../../types/Profile';
import { fetchProfile } from '../../../actions/user/viewProfile';
import { Col, Row } from 'reactstrap';

interface Props extends RouteComponentProps, Alerts {
  fetchProfile: Function;
  profile?: Profile;
}

class ViewProfile extends React.Component<Props, State> {
  matchedId: string = "";

  constructor(props: Props) {
    super(props);

    // Get our profileId passed through from URL props
    if (props.location && props.location.pathname) {
      this.matchedId = props.location.pathname.replace("/profiles/", "");
    }
    this.renderRow = this.renderRow.bind(this);
    this.renderContact = this.renderContact.bind(this);
  }

  componentDidMount() {
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (this.matchedId) {
      this.props.fetchProfile(this.matchedId);
    } else {
      this.setState({ errorMessage: "No profile with that id." });
    }
  }

  renderContact(){
    const {profile} = this.props;
    if(!profile) return;
    const { contact_email, contact_person, contact_position} = profile;

    return (
      [contact_person, contact_position, contact_email].map(contactField => (
        contactField ? <div> {contactField} </div> : null
      ))
    )
  }

  renderRow(label: string, value: string, isLink: boolean = false) {
    return (
      <div>
        {label}:
        <span className="ml-auto">
          {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          ) : (
            value
          )}
        </span>
      </div>
    );
  }

  render() {
    if (typeof this.props.profile === "undefined") {
      return "Loading...";
    }
    const {profile, errorMessage} = this.props;
    const {
      full_name,
      position,
      affiliation,
      city,
      country,
      biography,
      website,
      field_expertise,
      profile_type,
      profile_image,
      public_profile
    } = profile;
    const tags = ["marine wildlife", "adaptations at sea", "climate change"];

    return (
      <div id="profile">
        <ErrorMessage message={errorMessage} />
        <Row>
          <Col xs="12" md="6" className="left">
            <Row className="m-3">
              <Col xs="12" md="4">
                {!!profile_image ? (
                  <img className="responsive-img" src={profile_image} alt="" />
                ) : (
                  <></>
                )}
              </Col>
              <Col xs="12" md="8" className="biography-section">
                <h1>{full_name}</h1>
                <div className="align-bottom profession">
                  <div> {field_expertise} </div>
                  <div className="caption-text">
                  {groupProfileTypes.includes(profile_type) ? this.renderContact() : `${profile_type} Contributor` }
                  </div>
                </div>
              </Col>
            </Row>
            <Col xs="12">{biography}</Col>
          </Col>
          {!public_profile ? (
            <Col xs="12" md="6">
              <div className="m-3 details caption-text">
                {city || country
                  ? this.renderRow("Location", [city, country].join(" "))
                  : null}
                {website ? this.renderRow("Website", website, true) : null}
                {position ? this.renderRow("Position", position) : null}
                {affiliation ? this.renderRow("Affiliation", affiliation) : null}
                <div>
                  Most used concept tags
                  <p className="mt-5">
                    {tags.map((ea, index) => (
                      <span className="tags" key={index}>{ea}</span>
                    ))}
                  </p>
                </div>
              </div>
            </Col>
          ) : (
            ""
          )}
        </Row>
        <h4> Contributed Items </h4>
        <ViewCollection userId="4" />
      </div>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewProfile: State }) => {
  // tslint:disable-line: no-any
  return {
    errorMessage: state.viewProfile.errorMessage,
    profile: state.viewProfile.profile
  };
};

// Connect our redux store State to Props, and pass through the fetchProfile function.
export default withRouter(
  connect(
    mapStateToProps,
    { fetchProfile }
  )(ViewProfile)
);
