import * as React from "react";
import { connect } from "react-redux";

import { State } from "reducers/user/viewProfile";

import { RouteComponentProps, withRouter } from "react-router";

import "styles/components/pages/viewProfile.scss";
import { Alerts, ErrorMessage } from "../../utils/alerts";
import { Profile } from "../../../types/Profile";
import { fetchProfile } from "../../../actions/user/viewProfile";
import { Col, Row } from "reactstrap";

interface Props extends RouteComponentProps, Alerts {
  fetchProfile: Function;
  profile: Profile;
}

class ViewProfile extends React.Component<Props, State> {
  matchedId: string = "";

  constructor(props: any) {
    // tslint:disable-line: no-any
    super(props);

    // Get our profileId passed through from URL props
    if (props.location && props.location.pathname) {
      this.matchedId = props.location.pathname.replace("/profiles/", "");
    }
  }

  componentDidMount() {
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (this.matchedId) {
      this.props.fetchProfile(this.matchedId);
    } else {
      this.setState({ errorMessage: "No profile with that id." });
    }
  }

  render() {
    if (typeof this.props.profile === "undefined") {
      return "Loading...";
    }
    const {
      full_name,
      position,
      affiliation,
      city,
      country,
      biography,
      website,
      field_expertise,
      profile_type
      // public_profile
    } = this.props.profile;
    const tags = ["marine wildlife", "adaptations at sea", "climate change"];

    return (
      <div id="profile">
        <ErrorMessage message={this.props.errorMessage} />
        <Row>
          <Col xs="12" md="6" className="left">
            <Row className="m-3">
              <Col xs="12" md="4">
                {!!this.props.profile.profile_image ? (
                  <img
                    className="responsive-img"
                    src={this.props.profile.profile_image}
                    alt=""
                  />
                ) : (
                  <></>
                )}
              </Col>
              <Col xs="12" md="8" className="biography-section">
                <h1>{full_name}</h1>
                <div className="align-bottom profession">
                  <div> {field_expertise} </div>
                  <div className="caption-text">{profile_type} Contributor</div>
                </div>
              </Col>
            </Row>
            <Col xs="12">{biography}</Col>
          </Col>
          <Col xs="12" md="6">
            <div className="m-3 details caption-text">
              <div>
                Location:
                <span className="ml-auto">
                  {city}, {country}
                </span>
              </div>
              <div>
                Website:
                <span className="ml-auto">
                  <a href={website || ""} target="_blank">
                    {website}
                  </a>
                </span>
              </div>
              <div>
                Position: <span className="ml-auto">{position}</span>
              </div>
              <div>
                Affiliation: <span className="ml-auto">{affiliation}</span>
              </div>
              <div>
                Most used concept tags
                <p className="mt-5">
                  {tags.map(ea => (
                    <span className="tags">{ea}</span>
                  ))}
                </p>
              </div>
            </div>
          </Col>
        </Row>
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
