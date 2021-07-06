import * as React from "react";
import { connect } from "react-redux";
import { Button, Col, Row } from "reactstrap";
import { fetchItem } from "actions/items/viewItem";
import { ViewItemState } from "reducers/items/viewItem";
import { Alerts, ErrorMessage } from "../utils/alerts";
import { Item, itemType, Regions } from "../../types/Item";
import { FilePreview } from "../utils/FilePreview";
import SpecialMenu from "../utils/SpecialMenu";
import { Languages } from "../../types/Languages";
import { browser } from "../utils/browser";
import { RouteComponentProps, withRouter } from "react-router";
import "styles/components/pages/viewItem.scss";
import Share from "../utils/Share";
import LicenceLink from "../utils/LicenceLink";
import moment from "moment";
import { FileTypes } from "../../types/s3File";
import AudioPreview from "../layout/audio/AudioPreview";
import { dateFromTimeYearProduced } from "../../actions/home";
import { pushEntity as pushUserHistoryEntity } from "../../actions/user-history";
import {
  search as dispatchSearch,
  toggle as searchOpenToggle,
} from "../../actions/searchConsole";
import { createCriteriaOption } from "../search/SearchConsole";
import { toggle as collectionModalToggle } from "actions/modals/collectionModal";
import { toggle as itemModalToggle } from "actions/modals/itemModal";
import { UserHistoryState } from "../../reducers/user-history";
import { HomepageData } from "../../reducers/home";
import HtmlDescription from "../utils/HtmlDescription";
import _ from "lodash";
import generateFocusGradient from "../utils/gradientGenerator";
import { FaCode } from "react-icons/fa";
import { iframeItemEmbedCodeURL } from "urls";
import { itemURL } from "../../urls";

type MatchParams = {
  id: string;
};

interface Props extends RouteComponentProps<MatchParams>, Alerts {
  fetchItem: Function;
  collectionModalToggle: Function;
  itemModalToggle: Function;
  searchOpenToggle: Function;
  dispatchSearch: Function;
  pushUserHistoryEntity: Function;
  item: Item;
  userHistory?: UserHistoryState;
}

interface State {
  errorMessage: string | undefined;
  item: HomepageData | Item | undefined;
}

class ViewItem extends React.Component<Props, State> {
  browser: string;

  constructor(props: any) {
    // tslint:disable-line: no-any
    super(props);

    this.browser = browser();

    this.state = {
      errorMessage: undefined,
      item: undefined,
    };
  }

  componentDidMount() {
    this.pushItemToHistory();

    const { match } = this.props;
    let matchedItemId: string | null = null;

    // Get our itemId passed through from URL props
    if (match.params.id) {
      matchedItemId = match.params.id;
    }

    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (matchedItemId) {
      this.props.fetchItem(matchedItemId);
    } else {
      this.setState({ errorMessage: "No item with that id." });
    }
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<{}>
  ): void {
    this.pushItemToHistory(prevProps.item);
  }

  pushItemToHistory(prevItem?: Item) {
    if (this.props.item !== undefined) {
      if (prevItem !== undefined) {
        if (!_.isEqual(this.props.item, prevItem)) {
          const userHistoryEntity = this.createHistoryEntity();
          this.props.pushUserHistoryEntity(userHistoryEntity);
        }
      } else {
        const userHistoryEntity = this.createHistoryEntity();
        this.props.pushUserHistoryEntity(userHistoryEntity);
      }
    }
  }

  createHistoryEntity(): Item {
    return { ...this.props.item, __typename: "item" };
  }

  // @todo should be a util / dispatch
  onTagClick = (label: string, field: string) => {
    setTimeout(() => {
      this.props.collectionModalToggle(false);
      this.props.itemModalToggle(false);
      this.props.searchOpenToggle(true);
      this.props.dispatchSearch([createCriteriaOption(label, field)]);
    });
  };

  render() {
    if (typeof this.props.item === "undefined") {
      return <ErrorMessage message={this.props.errorMessage} />;
    }

    const {
      id,
      file,
      creators,
      title,
      description,
      item_subtype,
      regions,
      language,
      license,
      aggregated_concept_tags,
      aggregated_keyword_tags,
      journal,
      focus_action,
      focus_arts,
      focus_scitech,
      time_produced,
      year_produced,
      end_year_produced,
      venues,
      exhibited_at,
      copyright_holder,
      url,
      medium,
      item_type,
      directors,
      collaborators,
    } = this.props.item;

    if (item_type === itemType.IFrame && url && title) {
      return (
        <div id="item" className="container-fluid">
          <ErrorMessage message={this.props.errorMessage} />
          {url.match(/freq_waveall/)
            ? "Note that the loading button only turns into a play button after all audio files are downloaded. This mixer also requires a fair amount of memory to work."
            : ""}
          <iframe
            title={title}
            src={url}
            className={
              url.match(/freq/) ? "freq_wave-iframe" : "special_item-iframe"
            }
          ></iframe>
        </div>
      );
    }

    const ItemDetails = (props: {
      label: string;
      value: string | JSX.Element;
    }): JSX.Element => (
      <Row className="border-bottom subline details">
        <Col xs="12" md="6">
          {props.label}
        </Col>
        <Col xs="12" md="6">
          {props.value}
        </Col>
      </Row>
    );

    const isAudio =
      (!!file && item_type === itemType.Audio) ||
      (!!file && file.type === FileTypes.Audio);

    if (this.props.userHistory && this.props.userHistory.loading) {
      return <></>;
    }

    return (
      <div id="item" className="container-fluid">
        <ErrorMessage message={this.props.errorMessage} />
        {file && file.url ? (
          <Row className="file">
            {isAudio ? (
              <div className="w-100">
                <AudioPreview
                  data={{
                    id: `${id}_slider`,
                    title: title ? title : "",
                    url: file.url,
                    isCollection: false,
                    date: dateFromTimeYearProduced(
                      time_produced,
                      year_produced,
                      end_year_produced
                    ),
                  }}
                />
              </div>
            ) : (
              <FilePreview file={file} isSolo={true}/>
            )}
          </Row>
        ) : (
          <></>
        )}
        <Row>
          <Col xs="12" md="8" className="left border-right">
            <Row>
              <Col
                xs={{ size: 12, order: 2 }}
                md={{ size: 8, order: 1 }}
                className="creators"
              >
                {creators ? creators.join(", ") : <></>}
              </Col>
              <Col
                xs={{ size: 12, order: 1 }}
                md={{ size: 4, order: 2 }}
                className="subline text-right"
              >
                {item_subtype}
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="flex items-center justify-between">
                  <h1>{title}</h1>
                  <div className="flex items-center">
                    {!!id && (
                      <h3 style={{ marginLeft: "1rem" }}>
                        <Share
                          variant="prefixedWithHostname"
                          text={itemURL(id)}
                        />
                      </h3>
                    )}
                    {(file && file.type !== FileTypes.VideoEmbed)? (
                    <h3>
                      <Share
                        variant="fullText"
                        iconComponent={<FaCode />}
                        text={iframeItemEmbedCodeURL(
                          this.props.item.id,
                          this.props.item.title || ""
                        )}
                      />
                    </h3>) : <></>
                    }
                  </div>
                </div>
              </Col>
            </Row>

            <Row>
              {file &&
              (file.type === FileTypes.DownloadText ||
                file.type === FileTypes.Pdf) &&
              file.url ? (
                <Col xs="12" className="download pb-2">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    Click here to download this file.
                  </a>
                </Col>
              ) : (
                ""
              )}
              <Col className="description">
                {description ? (
                  <HtmlDescription description={description} />
                ) : (
                  <></>
                )}
              </Col>
            </Row>
          </Col>
          <Col xs="12" md="4" className="right">
            {!!journal ? (
              <ItemDetails label="Publisher" value={journal} />
            ) : (
              <></>
            )}
            {!!time_produced ? (
              <ItemDetails
                label="Date Produced"
                value={moment(time_produced, moment.defaultFormatUtc).format(
                  "Do MMMM YYYY"
                )}
              />
            ) : year_produced ? (
              <ItemDetails
                label="Year Produced"
                value={dateFromTimeYearProduced(
                  time_produced,
                  year_produced,
                  end_year_produced
                )}
              />
            ) : (
              <></>
            )}
            {!!venues && venues.length ? (
              <ItemDetails
                label={
                  venues.length > 1 ? "Publication Venue" : "Publication Venues"
                }
                value={`${venues.join(", ")}`}
              />
            ) : (
              <></>
            )}
            {!!exhibited_at && exhibited_at.length ? (
              <ItemDetails
                label="Exhibited At"
                value={`${exhibited_at.join(", ")}`}
              />
            ) : (
              <></>
            )}
            {!!regions && regions.length ? (
              <ItemDetails
                label={regions.length > 1 ? "Regions" : "Region"}
                value={regions.map((region) => Regions[region]).join(", ")}
              />
            ) : (
              ""
            )}
            {directors && directors.length ? (
              <ItemDetails
                label={directors.length > 1 ? "Directors" : "Director"}
                value={directors.join(", ")}
              />
            ) : (
              <></>
            )}
            {collaborators && collaborators.length ? (
              <ItemDetails
                label={
                  collaborators.length > 1 ? "Collaborators" : "Collaborator"
                }
                value={collaborators.join(", ")}
              />
            ) : (
              <></>
            )}

            {!!language ? (
              <ItemDetails label="Language" value={Languages[language]} />
            ) : (
              ""
            )}
            {!!license ? <LicenceLink licence={license} /> : ""}
            {!!copyright_holder ? (
              <ItemDetails label="Copyright Owner" value={copyright_holder} />
            ) : (
              ""
            )}
            {!!medium ? <ItemDetails label="Medium" value={medium} /> : ""}
            {!!url ? (
              <ItemDetails
                label="Relation"
                value={
                  <a href={url} target="_blank" rel="noreferrer noopener">
                    Click here to view
                  </a>
                }
              />
            ) : (
              ""
            )}

            {!!aggregated_concept_tags && aggregated_concept_tags.length ? (
              <Row className="border-bottom subline details">
                <Col xs="12" className="mb-2">
                  Concept Tags
                </Col>
                <Col xs="12">
                  <div className="tagWrapper">
                    {aggregated_concept_tags.map((t) => {
                      return (
                        <Button
                          className="page-link tag d-inline-block text-left"
                          style={{
                            padding: 0,
                            marginBottom: 10,
                            background: "none",
                          }}
                          key={t.tag_name}
                          onClick={() =>
                            this.onTagClick(t.tag_name, "concept_tag")
                          }
                        >
                          #{t.tag_name}
                        </Button>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            ) : (
              ""
            )}
            {!!aggregated_keyword_tags && aggregated_keyword_tags.length ? (
              <Row className="subline details">
                <Col xs="12">Keyword Tags</Col>
                <Col xs="12">
                  <div className="tagWrapper">
                    {aggregated_keyword_tags.map((t) => {
                      return (
                        <Button
                          className="ml-1 tag d-inline-block text-left"
                          style={{
                            padding: 0,
                            paddingRight: 15,
                            paddingLeft: 0,
                            margin: 0,
                            background: "none",
                          }}
                          key={t.tag_name}
                          onClick={() =>
                            this.onTagClick(t.tag_name, "keyword_tag")
                          }
                        >
                          #{t.tag_name}
                        </Button>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            ) : (
              ""
            )}
            <Row>
              <Col className="px-0">
                <div
                  style={{
                    height: "15px",
                    background: generateFocusGradient(
                      focus_arts,
                      focus_scitech,
                      focus_action
                    ),
                  }}
                />
              </Col>
            </Row>
            <Row>
              <SpecialMenu id={id} />
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

// State to props
const mapStateToProps = (state: {
  viewItem: ViewItemState;
  userHistory: UserHistoryState;
}) => ({
  errorMessage: state.viewItem.errorMessage,
  item: state.viewItem.item,
  userHistoryLoading: state.userHistory.loading,
});

// Connect our redux store State to Props, and pass through the fetchItem function.
export default withRouter(
  connect(mapStateToProps, {
    fetchItem,
    collectionModalToggle,
    itemModalToggle,
    searchOpenToggle,
    dispatchSearch,
    pushUserHistoryEntity,
  })(ViewItem)
);
