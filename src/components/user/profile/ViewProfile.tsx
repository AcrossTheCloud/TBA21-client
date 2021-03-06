import * as React from "react";
import { connect } from "react-redux";

import { State } from "reducers/user/viewProfile";

import { RouteComponentProps, withRouter } from "react-router";

import "styles/components/pages/viewProfile.scss";
import { Alerts, ErrorMessage } from "../../utils/alerts";
import { Profile } from "../../../types/Profile";
import {
  fetchProfile,
  fetchProfileItemsAndCollections,
} from "../../../actions/user/viewProfile";
import { Col, Row, Spinner } from "reactstrap";
import "../../../styles/components/pages/viewProfile.scss";
import { Item } from "types/Item";
import { toggle as itemModalToggle } from "actions/modals/itemModal";
import { toggle as collectionModalToggle } from "actions/modals/collectionModal";
import { Collection } from "types/Collection";
import { debounce } from "lodash";
import DataLayout from "components/utils/DataLayout";
import Share from "../../utils/Share";
import { viewProfileURL } from "../../../urls";

interface Props extends RouteComponentProps, Alerts {
  fetchProfile: Function;
  profile: Profile;
  data: (Item | Collection)[];
  itemModalToggle: Function;
  collectionModalToggle: Function;
  isItemsAndCollectionsLoading: boolean;
  fetchProfileItemsAndCollections: Function;
  fetchedAllItemsAndCollections: boolean;
}

class ViewProfile extends React.Component<Props, State> {
  matchedId: string = "";

  constructor(props: any) {
    // tslint:disable-line: no-any
    super(props);
    this.handleInfiniteScroll = debounce(this.handleInfiniteScroll, 200);
  }

  componentDidMount() {
    this.initializeProfileData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.fetchedAllItemsAndCollections) {
      document.removeEventListener("scroll", this.handleInfiniteScroll);
    }

    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.initializeProfileData();
    }
  }

  componentWillUnmount() {
    document.removeEventListener("scroll", this.handleInfiniteScroll);
  }

  initializeProfileData = () => {
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    const matchedId = this.props.location.pathname.replace("/profiles/", "");
    if (matchedId) {
      this.props.fetchProfile(matchedId);
      document.addEventListener("scroll", this.handleInfiniteScroll);
    } else {
      this.setState({ errorMessage: "No profile with that id." });
    }
  };

  handleInfiniteScroll = () => {
    if (
      window.innerHeight + window.pageYOffset >=
      document.body.offsetHeight - 200
    ) {
      this.props.fetchProfileItemsAndCollections();
    }
  };

  locationString(): string {
    const { city, country } = this.props.profile;
    if (city && city.length && !country) {
      return city;
    } else if (!city && country && country.length) {
      return country;
    } else if (city?.length && country?.length) {
      return `${city}, ${country}`;
    } else {
      return "—";
    }
  }

  render() {
    if (typeof this.props.profile === "undefined") {
      return (
        <div id="viewProfile">
          <ErrorMessage message={this.props.errorMessage} />
        </div>
      );
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
      <div id="viewProfile">
        <ErrorMessage message={this.props.errorMessage} />
        <Row className="profile-info-container">
          <Col xs="12" md="6" className="left">
            <Row className="profile-section">
              <Col xs="12" md="auto" style={{ paddingRight: 0 }}>
                {!!this.props.profile.profile_image ? (
                  <img
                    className="profile-image"
                    src={this.props.profile.profile_image}
                    alt=""
                  />
                ) : (
                  <div className="profile-image"></div>
                )}
              </Col>
              <Col xs="12" md={true} className="profile-description">
                <div className="flex items-center justify-between">
                  <h1>{full_name}</h1>
                  <h3>
                    <Share
                      variant="prefixedWithHostname"
                      text={viewProfileURL(this.props.profile.id)}
                    />
                  </h3>
                </div>
                <div>
                  <p>{field_expertise}</p>
                  <p className="profile-type">{profile_type}</p>
                </div>
              </Col>
            </Row>

            <Col xs="12" style={{ marginTop: "2rem" }}>
              <h5>{biography}</h5>
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
                  <span className="details-label">Website</span>
                  {website ? <a href={website}>{website}</a> : "—"}
                </Col>
                <Col xs="12" className="details">
                  <span className="details-label">Position</span>
                  {position && position.length ? position : "—"}
                </Col>
                <Col xs="12" className="details">
                  <span className="details-label">Affiliation</span>
                  <span>
                    {affiliation && affiliation.length ? affiliation : "—"}
                  </span>
                </Col>
              </div>
              <div className="gradient-line"></div>
            </div>
          </Col>
        </Row>
        <Row className="author-items">
          <Col xs="12">
            <p>Contributed Items And Collections</p>
          </Col>
          {this.props.data.map((d) => (
            <DataLayout
              key={d.id}
              data={d}
              itemModalToggle={this.props.itemModalToggle}
              collectionModalToggle={() =>
                this.props.collectionModalToggle(true, d)
              }
            />
          ))}
          <div className="author-loading">
            {this.props.isItemsAndCollectionsLoading && (
              <Spinner type="grow" variant="dark" />
            )}
          </div>
          {this.props.fetchedAllItemsAndCollections && (
            <div className="author-all-fetched">
              No more items and collections from {this.props.profile.full_name}!
            </div>
          )}
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
    profile: state.viewProfile.profile,
    data: generateItemsAdCollectionsGrid(
      state.viewProfile.items,
      state.viewProfile.collections
    ),
    isItemsAndCollectionsLoading:
      state.viewProfile.isItemsAndCollectionsLoading,
    fetchedAllItemsAndCollections:
      !state.viewProfile.collectionsHasMore && !state.viewProfile.itemsHasMore,
  };
};

// Connect our redux store State to Props, and pass through the fetchProfile function.
export default withRouter(
  connect(mapStateToProps, {
    fetchProfile,
    itemModalToggle,
    collectionModalToggle,
    fetchProfileItemsAndCollections,
  })(ViewProfile)
);

// memoize this if performance becomes a problem
const generateItemsAdCollectionsGrid = (
  items: Item[],
  collections: Collection[]
): (Item | Collection)[] => {
  let pendingCollections = [...collections];
  let pendingItems = [...items];
  let result: (Item | Collection)[] = [];
  while (pendingItems.length || pendingCollections.length) {
    result = [
      ...result,
      ...pendingCollections.splice(0, 3),
      ...pendingItems.splice(0, 3),
    ];
  }
  return result;
};
